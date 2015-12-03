## Code-blast plugin for Codemirror

This is a quick Codemirror port of [lovely experiement by Joel Besada](https://twitter.com/JoelBesada/status/670343885655293952).

Simply put `code-blast.js` in your project and set the `blastCode` option to true when initializing codemirror. This library comes with inbuilt 2 types of effect.

[Live Demo](https://rawgit.com/chinchang/code-blast-codemirror/master/demo/index.html)

![Demo](/demo.gif)

```js
var cm = CodeMirror(document.body, {
	blastCode: { effect: 1}, // `effect` can be 1 or 2
}
```

### Coming up

- Configurable options
