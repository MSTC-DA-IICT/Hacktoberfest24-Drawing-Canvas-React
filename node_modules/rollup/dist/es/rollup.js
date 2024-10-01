/*
  @license
	Rollup.js v4.23.0
	Tue, 01 Oct 2024 07:09:35 GMT - commit ed98e0821e6ad064839f0af46ceca061adbe3f14

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
export { version as VERSION, defineConfig, rollup, watch } from './shared/node-entry.js';
import './shared/parseAst.js';
import '../native.js';
import 'node:path';
import 'path';
import 'node:process';
import 'node:perf_hooks';
import 'node:fs/promises';
import 'tty';
