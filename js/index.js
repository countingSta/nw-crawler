var fs = require("fs");
var path = require("path");
var root_dir = path.dirname(process.execPath);
var exec = require('child_process').exec;
var gui = require('nw.gui');

var SETTINGS_PWD = "welcome";

