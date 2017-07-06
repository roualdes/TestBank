/*
 * Copyright (c) 2017-present, Edward A. Roualdes.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import Immutable from 'immutable';

const Problem = Immutable.Record({
  uid: "",
  question: "",
  answer: "",
  author: "",
  keywords: [],
  id: "",
  exportable: false,
});

export default Problem;