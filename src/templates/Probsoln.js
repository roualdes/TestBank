/**
 * Copyright (c) 2017-present, Edward A. Roualdes.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import Format from './Format';


function Probsoln(probs) {
  return Format`% Data types and descriptive exam questions
<<echo=FALSE, warning=FALSE, message=FALSE>>=
library(lattice)
library(xtable)
library(ggplot2)
library(dplyr)
library(MASS)
library(openintro)

ncbirths <- read.csv("NCbirths.csv",header=TRUE)
fuelly <- read.table("fuelups.csv", sep=",", header=TRUE)
fuelly$date <- as.Date(as.character(fuelly$fuelup_date), format="%m/%d/%Y")
Mode <- function(x) {
  ux <- unique(x)
  ux[which.max(tabulate(match(x, ux)))]
}
@
<<echo=FALSE>>=
## dog
dog_age <- c(98,90,92,70,83,45,92,90,76,72,74,63,88,75,84,80,80,68,77,92)
mean.age <- round(mean(dog_age),1); var.age <- round(var(dog_age),1)
sd.age <- round(sqrt(var.age),1); q1.age <- quantile(dog_age, .25)
q3.age <- quantile(dog_age, .75)
## length of stay in hospital
los <- c(4, 4, 12, 18, 9, 6, 12, 3, 7, 15, 7, 3, 55, 1, 10, 13, 5, 7, 1, 26, 9)
mean.los <- round(mean(los),1); var.los <- round(var(los),1)
sd.los <- round(sqrt(var.los),1); q1.los <- quantile(los, .25)
q3.los <- quantile(los, .75)
@

% In 2004, the state of North Carolina released a large data set containing information on births recorded in this state. The codebook is available as a handout. Answer the following questions about this data.
<<echo=FALSE, warning=FALSE, message=FALSE>>=
gh <- ncbirths %>% filter(!is.na(gained) & !is.na(habit))
fage <- na.omit(ncbirths$fage)
q3.fage <- quantile(fage,.75)
@

${probs.map(({ question, id, answer }) => Format`\begin{defproblem}{${id}}[fragile]
  ${question}
  \begin{onlysolution}[fragile]%
    \begin{solution}
      ${answer}
    \vspace{-2cm}
    \end{solution}
  \end{onlysolution}
\end{defproblem}

`)}
`;
}

export default Probsoln;
