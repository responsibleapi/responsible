ace.define("ace/mode/kdl", function (require, exports, module) {
  "use strict"

  var oop = require("../lib/oop")
  var TextMode = require("./text").Mode
  var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules

  var KDLHighlightRules = function () {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
      start: [
        {
          include: "#null",
        },
        {
          include: "#boolean",
        },
        {
          include: "#float_fraction",
        },
        {
          include: "#float_exp",
        },
        {
          include: "#decimal",
        },
        {
          include: "#hexadecimal",
        },
        {
          include: "#octal",
        },
        {
          include: "#binary",
        },
        {
          include: "#raw-strings",
        },
        {
          include: "#strings",
        },
        {
          include: "#type-annotation",
        },
        {
          include: "#block_comment",
        },
        {
          include: "#block_doc_comment",
        },
        {
          include: "#slashdash_block_comment",
        },
        {
          include: "#slashdash_comment",
        },
        {
          include: "#slashdash_node_comment",
        },
        {
          include: "#line_comment",
        },
        {
          include: "#attribute",
        },
        {
          include: "#node_name",
        },
      ],
      "#float_fraction": [
        {
          token: "constant.numeric.float.rust",
          regex:
            /\b(?:[0-9\-\+]|\-|\+)[0-9_]*\.[0-9][0-9_]*(?:[eE][+-]?[0-9_]+)?\b/,
          comment: "Floating point literal (fraction)",
        },
      ],
      "#float_exp": [
        {
          token: "constant.numeric.float.rust",
          regex: /\b[0-9][0-9_]*(?:\.[0-9][0-9_]*)?[eE][+-]?[0-9_]+\b/,
          comment: "Floating point literal (exponent)",
        },
      ],
      "#decimal": [
        {
          token: "constant.numeric.integer.decimal.rust",
          regex: /\b[0-9\-\+][0-9_]*\b/,
          comment: "Integer literal (decimal)",
        },
      ],
      "#hexadecimal": [
        {
          token: "constant.numeric.integer.hexadecimal.rust",
          regex: /\b0x[a-fA-F0-9_]+\b/,
          comment: "Integer literal (hexadecimal)",
        },
      ],
      "#octal": [
        {
          token: "constant.numeric.integer.octal.rust",
          regex: /\b0o[0-7_]+\b/,
          comment: "Integer literal (octal)",
        },
      ],
      "#binary": [
        {
          token: "constant.numeric.integer.binary.rust",
          regex: /\b0b[01_]+\b/,
          comment: "Integer literal (binary)",
        },
      ],
      "#node_name": [
        {
          token: "entity.name.tag",
          regex: /(?![\\{\}<>;\[\]\=,\(\)\s])[\u0021-\uFFFF]+/,
        },
      ],
      "#attribute": [
        {
          token: [
            "entity.other.attribute-name.kdl",
            "punctuation.separator.key-value.kdl",
          ],
          regex: /(?![\\{\}<>;\[\]\=,\(\)\s])([\u0021-\uFFFF]+)(=)/,
        },
      ],
      "#null": [
        {
          token: "constant.language.null.kdl",
          regex: /\bnull\b/,
        },
      ],
      "#boolean": [
        {
          token: "constant.language.boolean.kdl",
          regex: /\b(?:true|false)\b/,
        },
      ],
      "#strings": [
        {
          token: "string.quoted.double.kdl",
          regex: /"/,
          push: [
            {
              token: "string.quoted.double.kdl",
              regex: /"/,
              next: "pop",
            },
            {
              token: "constant.character.escape.kdl",
              regex: /\\(?::?[nrtbf\\"]|u\{[a-fA-F0-9]{1,6}\})/,
            },
            {
              defaultToken: "string.quoted.double.kdl",
            },
          ],
        },
      ],
      "#raw-strings": [
        {
          token: "string.quoted.double.raw.kdl",
          regex: /b?r#*"/,
          push: [
            {
              token: "string.quoted.double.raw.kdl",
              regex: /"#*/,
              next: "pop",
            },
            {
              defaultToken: "string.quoted.double.raw.kdl",
            },
          ],
        },
      ],
      "#type-annotation": [
        {
          token: "entity.name.type.kdl",
          regex: /\(/,
          push: [
            {
              token: "entity.name.type.kdl",
              regex: /\)/,
              next: "pop",
            },
            {
              include: "#attribute",
            },
            {
              include: "#strings",
            },
            {
              include: "#raw-strings",
            },
            {
              defaultToken: "entity.name.type.kdl",
            },
          ],
        },
      ],
      "#block_doc_comment": [
        {
          token: "comment.block.documentation.kdl",
          regex: /\/\*[\*!](?![\*\/])/,
          push: [
            {
              token: "comment.block.documentation.kdl",
              regex: /\*\//,
              next: "pop",
            },
            {
              include: "#block_doc_comment",
            },
            {
              include: "#block_comment",
            },
            {
              defaultToken: "comment.block.documentation.kdl",
            },
          ],
          comment: "Block documentation comment",
        },
      ],
      "#block_comment": [
        {
          token: "comment.block.kdl",
          regex: /\/\*/,
          push: [
            {
              token: "comment.block.kdl",
              regex: /\*\//,
              next: "pop",
            },
            {
              include: "#block_doc_comment",
            },
            {
              include: "#block_comment",
            },
            {
              defaultToken: "comment.block.kdl",
            },
          ],
          comment: "Block comment",
        },
      ],
      "#line_comment": [
        {
          token: "comment.line.double-slash.rust",
          regex: /\/\//,
          push: [
            {
              token: "comment.line.double-slash.rust",
              regex: /$/,
              next: "pop",
            },
            {
              defaultToken: "comment.line.double-slash.rust",
            },
          ],
          comment: "Single-line comment",
        },
      ],
      "#slashdash_comment": [
        {
          token: "comment.line.double-slash",
          regex: /(?<!^)\/-/,
          push: [
            {
              token: "comment.line.double-slash",
              regex: /\s/,
              next: "pop",
            },
            {
              defaultToken: "comment.line.double-slash",
            },
          ],
          comment: "Slashdash inline comment",
        },
      ],
      "#slashdash_node_comment": [
        {
          token: "comment.block",
          regex: /(?<=^)\/-/,
          push: [
            {
              token: "comment.block",
              regex: /}/,
              next: "pop",
            },
            {
              defaultToken: "comment.block",
            },
          ],
          comment: "Slashdash node comment",
        },
      ],
      "#slashdash_block_comment": [
        {
          token: "comment.block",
          regex: /\/-{/,
          push: [
            {
              token: "comment.block",
              regex: /}/,
              next: "pop",
            },
            {
              defaultToken: "comment.block",
            },
          ],
          comment: "Slashdash block comment",
        },
      ],
    }

    this.normalizeRules()
  }

  KDLHighlightRules.metaData = {
    $schema:
      "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    comment:
      "Some of these patterns are taken straight from rust-analyzer: https://github.com/rust-lang/vscode-rust/blob/master/rust-analyzer/editors/code/rust.tmGrammar.json. Some was also taken from https://github.com/arm32x/vscode-sdlang/blob/master/syntaxes/sdlang.tmLanguage.json",
    name: "KDL",
    scopeName: "source.kdl",
  }

  oop.inherits(KDLHighlightRules, TextHighlightRules)
  // TODO: pick appropriate fold mode
  var FoldMode = require("./folding/cstyle").FoldMode

  var Mode = function () {
    this.HighlightRules = KDLHighlightRules
    this.foldingRules = new FoldMode()
  }
  oop.inherits(Mode, TextMode)
  ;(function () {
    // this.lineCommentStart = ""/-{"";
    // this.blockComment = {start: ""/*"", end: ""*/""};
    // Extra logic goes here.
    this.$id = "ace/mode/kdl"
  }).call(Mode.prototype)

  exports.Mode = Mode
})
