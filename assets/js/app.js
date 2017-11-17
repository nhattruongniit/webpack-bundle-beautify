function setDecodeResult(result) {
    var decodeTarget = document.getElementById('bundle-decoded');

    decodeTarget.editor.setValue('// Decoding...');
    decodeTarget.editor.setValue(result);
    decodeTarget.editor.clearSelection();
    decodeTarget.editor.scrollToLine(0);
    decodeTarget.editor.gotoLine(1);
}

function emptyModule(name) {
    return [
        'function ' + name + '()',
        '{',
        '    throw new Error("Module ' + name + ' is empty");',
        '}'
    ].join("\n");
}

function webpackJsonp() {
    var modules = arguments[1];
    var moduleInStringList = [];
    var modulePrefix = '// Start of module #';
    var moduleEndPrefix = '// End of module #';
    var moduleNamePrefix = 'Module_';
    var i = 0, modulesCount = modules.length;


    for (; i < modulesCount; i++) {
        if (!modules[i]) {
            moduleInStringList.push([
                modulePrefix + i, "\n",
                '' + emptyModule(moduleNamePrefix + i), "\n",
                moduleEndPrefix + i, "\n\n"
            ].join("\n"));

            continue;
        }

        var moduleAsString = '' + modules[i];
        var moduleName = moduleNamePrefix + i;

        var moduleArgsString = moduleAsString.slice(moduleAsString.indexOf('(') + 1, moduleAsString.indexOf(')'));
        var moduleArgs = moduleArgsString.split(',').map(function (value) {
            return value.trim();
        });

        var moduleContent = moduleAsString.slice(moduleAsString.indexOf('{') + 1, moduleAsString.lastIndexOf('}'));
        var moduleRenameMap = {
            module: moduleArgs[0],
            exports: moduleArgs[1] ? moduleArgs[1] : undefined,
            __webpack_require__: moduleArgs[2] ? moduleArgs[2] : undefined
        };

        // Replace module args name
        for (var targetName in moduleRenameMap) {
            if (!moduleRenameMap.hasOwnProperty(targetName) || typeof moduleRenameMap[targetName] === 'undefined') {
                continue;
            }

            moduleContent = moduleContent.replace(new RegExp(moduleRenameMap[targetName], 'gi'), targetName);
            moduleContent = moduleContent.replace(new RegExp(targetName + '\\((\\d*)\\)', 'g'), targetName + '(' + moduleNamePrefix + '$1)');
        }


        // Join parts to make a complete module
        moduleAsString = 'function ' + moduleName + '(' + Object.keys(moduleRenameMap).join(', ') + ')\n{' + moduleContent + '\n}';


        moduleInStringList.push([
            modulePrefix + i, "\n",
            '' + moduleAsString, "\n",
            moduleEndPrefix + i, "\n\n"
        ].join("\n"));
    }

    setDecodeResult(moduleInStringList.join("\n"));
}

function downloadText(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function decodeIt() {
    var editor = document.getElementById('bundle-source').editor;

    eval(editor.getValue());
}

function downloadDecoded() {
    var decodeTarget = document.getElementById('bundle-decoded');

    downloadText('bundle_decoded.js', decodeTarget.editor.getValue());
}

(function () {
    ['bundle-source', 'bundle-decoded'].forEach(function (id) {
        var dom = document.getElementById(id);
        var editor = ace.edit(dom);
        var editorSession = editor.getSession();

        editor.setTheme("ace/theme/monokai");
        editor.setShowPrintMargin(false);
        editorSession.setMode("ace/mode/javascript");
        editorSession.setUseWrapMode(false);

        dom.editor = editor;
        dom.style.fontSize = '15px';
    });

})();