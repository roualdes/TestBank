# TestBank

To perform a quick test of the features, clone this repository and
`cd` into the directory. Launch TestBank with

```
$ npm install
$ python3 main.py
```

Then, in a separate window, run

```
$ curl http://localhost:3000/ID
```

where `ID` can be any exercise ID found in `db.json`.

## Examples

The directory `examples` contains two primary examples. First, an
approximate exam from my MATH 314 course at [Chico
State](https://www.csuchico.edu/). The second a working example of how
one could leverage TestBank with
[check50](https://cs50.readthedocs.io/check50/). Each subfolder has
its own README.

The files `exampels/add.r` and `examples/add.json` are intended to
demonstrate the file structure necessary for adding a question to
TestBank's databases.

## Data

For now, let's simplify things and store exercises in .json files. I'll use
[lowdb](https://github.com/typicode/lowdb) to interact with the JSON
files. There will be one file for exercises and one file for tags.
The last bit will be how each exercise is returned to the end user.

### Exercise schema

```
{
    id: "a unique ID, 4 characters long; [0-9a-zA-Z]{4}", # generated by TestBank
    language: python | r,
    exercise: "code to produce an exercise",
    tags: ["tag1", ..., "tagT"] # planned but not implemented,
}
```

### Tags

If a user searches the database with a complex query such as `tags: tag1 AND (tag2 OR tag3)`, then the following secondary database should
make for more efficient searching.

```
{
    tag1: [id1, ..., idA],
    tag2: [id1, ..., idB],
    ...
    tagT: [id1, ..., idT]
}
```

After collecting the queried tags' arrays, simple set operations
should enable direct replacement of AND with `&&` and OR with `||`.

### Output schema

Each exercise will be returned from the TestBank server as a JSON
object with one of the two following structures. If an exercise
is requested, the user will receive a JSON object with the following schema

```
{
    id: "a unique ID",
    seed: 1234,
    context: "the context of this exercise",
    questions: ["partA", ..., "partZ"],
    random: {X: x, μ: m, σ: s} # Associative Array specific to language
    # eg R => list(), Python => dict() or {}
}
```

The order of the following elements of an exercise's output schema is not important.

- `id` string. A string of 4 characters, [0-9a-zA-Z]{4}, that uniquely
  identifies each exercise. TestBank will generate these autmatically
  upon insertion of an exercise into its database.
- `seed` int. A seed for the (pseudo) random number generation which is
  constrained to be in `[1, min(R int, or Numpy np.uint32)] = [1, 2147483647]`. If no seed is specified with each request for an
  exercise (or its solution), TestBank will randomly chose a seed.
  While the `seed` key is required, the value does not necessarily have
  to exist.
- `context` string. A string the sets up the exercises context. If no
  follow up questions are involved in an exercise, the `context` can
  contain the question/prompt.
- `questions` array of strings. The `questions` array holds parts,
  say A, B, C, D, and E, of an exercise as strings. While the
  `questions` key is required, the value is an optional.
- `random` associative array. The `random` object holds named
  elements of the randomly generated components of an exercise. While
  the `random` key is required, the value is an optional.

If a solution is requested, the user will receive a JSON object with
the following schema

```
{
  id: "a unique ID",
  seed: 1234,
  solutions: ["partA", ..., "partZ"],
  random: {X: x, μ: m, σ: s} # Associative Array specific to language
  # eg R => list(), Python => dict() or {}
}
```

The order of the following elements of an exercise's solution schema is
not important.

- `id` string. A string of 4 characters, [0-9a-zA-Z]{4}, that
  uniquely identifies each exercise. TestBank will generate these
  autmatically upon insertion of an exercise into its database.
- `seed` int. A seed for the (pseudo) random number generation which
  is constrained to be in `[1, min(R int, or Numpy np.uint32)] = [1, 2147483647]`. If no seed is specified with each request for an
  exercise (or its solution), TestBank will randomly chose a seed.
  While the `seed` key is required, the value does not necessarily have
  to exist.
- solution array of strings. The `solution` array contains answers to
  each part of the exercises `questions`.
- `random` associative array. The `random` object holds named
  elements of the randomly generated components of an exercise. While
  the `random` key is required, the value is an optional.

## Writing exercises

To write an exercise, you must at least use the following structure,
inclusive of the custom [Mustache](https://github.com/janl/mustache.js) tags
for the exercise's ID:

```
id = '#< ID >#'
... code to produce Output schema
```

These custom Mustache tags have two benefits. First, they help
prevent my text editor from getting confused while developing TestBank
exercises, at least within some fairly standard data science
programming languages, R, Python, Julia. Second, they simplify writing LaTeX
within Python strings, since Python's string formatting insists on
double curly braces (otherwise used in Mustache) to get single curly
braces (used in LaTeX) into a string.

Examples exist in the
[examples](https://github.com/roualdes/testbank/tree/master/examples)
directory.

### Extra Mustache tags

If you want to provide a seed and/or solutions, and keep the solution
hidden from the website, use Mustache tags that allow TestBank to
selectively ignore the exercise and/or the solution.

```
... code necessary for both exercise and solution
id = '#< ID >#'
seeed = #< SEED >#

#< #exercise >#
... code to produce exercise Output schema
#< /exercise >#

#< #solution >#
... code to produce solution Output schema
#< /solution >#
```

It is possible to ignore the seed template entirely. Simply don't put
the seed template within the exercise's code.

The solution template has two goals. First, to enable a request for a
specific exercise to return only the solution. Second, when a website
that permits searching through TestBank's database is developed, the
solution template is intended to allow for hidden solutions. Thus any
exercise could be searched, found, and read without displaying the
solution.

More examples exist in the
[examples](https://github.com/roualdes/testbank/tree/master/examples)
directory.

## Checking an exercise before entering it into the database

The goal is to make entering exercises into the database as automatic
as possible, while simultaneously addressing _security_ of the TestBank
sever, _stability_ of the kernel, and _response_ time.

### Steps

TODO can this be simplified to one script?

Assume the exercise to be entered is stored in the path
`examples/add.r` with meta data file at `examples/add.json`. All
calls to `node cli.js` are described in more detail below.

1. Eyeball code in `add.r` for malicious content.
   Ensure
2. Mustache templating is working with
   `node cli.js test examples/add.json exercise` and
   `node cli.js test examples/add.json solution`.
3. run time is approximately less 2 seconds by
   testing the exercise with something like
   `time lr -e "$(node cli.js test examples/add.json exercise)"`
4. the exercise produces valid JSON with
   `lr -e "$(node cli.js test examples/add.json exercise)" | python -m json.tool`
5. the returned JSON has the appropriate exercise and solution
   schema. If [jq](https://stedolan.github.io/jq/) is installed, then
   the bash script `./test_schema.sh` can help via
   `lr -e "$(node cli.js test examples/add.json exercise)" | python -m json.tool | bash ./test_schema.sh`

If the tests above run, insert the exercise to TestBank's database
with the `upsert` command from TestBank's CLI.

## TestBank command line interface (CLI)

TestBank's GitHub repository comes with a command line interface,
`cli.js`, which attempts to help with testing exercises/solutions and
entering exercises/solutions into the database. The `node` commands
below must be run from the root directory of this repository.

### Testing

To test whether or not an exercise will run (after the Mustache tags
are entered), consider the file
[examples/add.r](https://github.com/roualdes/testbank/tree/master/examples/add.r).
At the command line, with
[littler](http://dirk.eddelbuettel.com/code/littler.html)
installed/aliased as `lr` run

```
$ lr -e "$(node cli.js test examples/add.json exercise)"
```

If the above command runs just fine, then there's a hope that your
code will run on the TestBank kernel after being entered into the
TestBank database.

To test a Python solution, run

```
$ node cli.js test examples/ex01.json solution | python
```

### Inserting an exercise into TestBanks's database

To insert an exercise into TestBank's database, use the command line
interface as

```
$ node cli.js insert ex.json
```

Where `ex.json` is JSON file for an exercise which provides some meta
information about the exercise to be entered. See examples in the
[examples](https://github.com/roualdes/testbank/tree/master/examples)
directory for more information.

## TODO

[] Add real questions to databse.

[] Add HTML, online homework system-esque, example. Maybe
[bootswatch](https://bootswatch.com/)'s theme
[flatly](https://bootswatch.com/flatly/)?

[] Get started for FALL 2019 MATH 314 with check50.

[] Enable more complete/robust testing of the database and TestBank backend.

[] Authorization? I'm thinking anybody can see questions and the code
that generates them. Anybody can request a solution. But it should
necessitate some form of authorization to see the code the produces
the solutions. If seeds are used appropriately, then just knowing the
answer is 0.532 for a specific seed won't help much. And if no
randomization is appropriate for a question, then no likely no
solution code is appropriate.

[] Figure out versions of dependencies.

[] Develop a database searchable landing/home page for TestBank.

[] Insert (possible) FAQs as exercises in the database. Should double
as helping to explain how to use TestBank and show off some of the
features, like showing/hiding solutions and ignoring the SEED.

[] GZIP databases.

## Dependencies

To successfully run all of the examples, one needs

- [Node.js](https://nodejs.org/)
- [Python3](https://www.python.org/)
- [R](https://www.r-project.org/)

and the following packages within each language's ecosystem

- Use [pip](https://pip.pypa.io/en/stable/) to obtain
  - [jupyterlab](https://jupyterlab.readthedocs.io/en/stable/)
  - [numpy](https://www.numpy.org/)
  - [scipy](https://www.scipy.org/)
  - [pandas](https://pandas.pydata.org/)
- Use R's function `install.packages()` to obtain
  - [IRkernel](https://github.com/IRkernel/IRkernel)
    - After installation, in R (not RStudio), within a Terminal that
      has access to the Python envirnoment containing jupyterlab, run
      ```
      library(IRkernel)
      IRkernel::installspec()
      ```
  - [dplyr](https://dplyr.tidyverse.org/)
  - [tidyverse](https://ggplot2.tidyverse.org/)
  - [jsonlite](https://cran.r-project.org/web/packages/jsonlite/index.html)
  - [pander](https://rapporter.github.io/pander/)
  - [littler](http://dirk.eddelbuettel.com/code/littler.html)

### Development Dependencies

- [jq](https://stedolan.github.io/jq/)
- [bash](https://www.gnu.org/software/bash/)

THIS is my best attempt at a complete list, but I'm still iffy about
versions of everything. Let me know what I've missed.

## License

License: Open source, [BSD (3-clause)](https://opensource.org/licenses/BSD-3-Clause).
