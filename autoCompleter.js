
/******************************************************************************************
* InputScreen:
* Wrapper object that wrap the textarea where the auto-completion takes place.
* It reimplements the functions of the textarea jQuery element
* and implements new ones.
* */
function InputScreen(pTextareaEl) {
    this.jqEl = $(pTextareaEl);
    this.autoCompletionWidget = new AutoCompletionWidget(this);

    /*
    * InputScreen.keydown():
    * Shortcut to use this.jqEl.keydown
    * */
    this.keydown = function (pFunction) {
        this.jqEl.keydown(pFunction);
    };

    /*
    * InputScreen.keyup():
    * Shortcut to use this.jqEl.keyup
    * */
    this.keyup = function (pFunction) {
        this.jqEl.keyup(pFunction);
    };

    /*
    * InputScreen.focus():
    * Put the focus on the inputScreen
    * */
    this.focus = function () {
        this.jqEl.focus();
    };

    /*
    * InputScreen.getCursorLinePosition():
    * Returns the line number position of the cursor in the inputScreen
    * Not used in the code for now but one day how knows...
    * */
    this.getCursorLinePosition = function () {
        return (this.getInputStr().substr(0, this.getSelectionStart()).split('\n').length);
    };

    /*
    * InputScreen.getSelectionStart():
    * Returns the selectionStart value of the <textatrea#input> element.
    * This will be rewrote in a near future to be up to date ==> <REWRITE>
    * */
    this.getSelectionStart = function () {
        return (this.jqEl.get(0).selectionStart);
    };

    /*
    * InputScreen.getInputStr():
    * Gives the content of the inputScreen in raw str
    * */
    this.getInputStr = function () {
        return this.jqEl.val();
    };

    /*
    * InputScreen.getCurrentlyTypingWord():
    * Returns the word being typed by the user.
    * This function is used to filter the keywordsList in order to
    * display the suggested keywords according to what the user is currently typing.
    * */
    this.getCurrentlyTypingWord = function () {
        let inputTextFromStartToCursorPosition = this.getInputStr().substring(0, this.getSelectionStart());
        let lastWordOfcursorLine = inputTextFromStartToCursorPosition.split('\n').pop().split(' ').pop();

        return lastWordOfcursorLine;
    };

    /*
     * InputScreen.getCaretCoordinates():
     * Returns the Top and Left coordinates of the caret in the inputScreen.
     * Uses getCaretCoordinates() function defined in  ./textareaCaretPosition.js.
     * The code and a lot of other features are available here: https://github.com/component/textarea-caret-position
     * */
    this.getCaretCoordinates = function () {
        return getCaretCoordinates(this.jqEl.get(0), this.jqEl.get(0).selectionEnd);
    };

    /*
     * InputScreen.setContent(pValue):
     * Erase all the content of the inputScreen and set its content to pValue
     * */
    this.setContent = function (pValue) {
        this.jqEl.val(pValue)
    }

    /*
     * InputScreen.putCursorAt(pValue):
     * Put the cursor at the pValue position in the inputScreen
     * */
    this.putCursorAt = function (pPosition) {
        this.jqEl.prop('selectionEnd', pPosition)
    }
}

/******************************************************************************************
* AutoCompletionWidget:
* Wrapper Object that manages the auto-completion Widget displayed over the textarea.
* Attributes are:
* - this.currentKeywordSelectedIndex = the index of the selected keyword in the widget
*                                      (-1 if no keyword is selected)
* - this.nbKeywords = the number of keywords displayed in the widget
* - this.isVisible = boolean, true if the widget is asked to be visible while typing,
*                    false if not.
*                     
* - this.inputScreen = the inputScreen Object where the auto-completion takes place
* */
function AutoCompletionWidget(pInputScreen) {
    this.jqEl = $('<ul id="auto_completer"></ul>');
    this.jqEl.hide(0);
    this.jqEl.appendTo($('body'));

    this.currentKeywordSelectedIndex = -1;
    this.nbKeywords = 0;
    this.isVisible = false;
    this.inputScreen = pInputScreen;

    /*
    * AutoCompletionWidget.show():
    * Displays the auto-completion widget in the inputScreen
    * */
    this.show = function () {
        this.jqEl.fadeIn(100);
    };

    /*
    * AutoCompletionWidget.hide():
    * Hides the auto-completion widget
    * */
    this.hide = function () {
        let that = this;
        this.jqEl.fadeOut(100, function () {
            that.emptyContent();
        })
    };

    /*
    * AutoCompletionWidget.emptyContent():
    * Empty the content of the widget
    * */
    this.emptyContent = function () {
        this.jqEl.html('');
        this.nbKeywords = 0;
        this.currentKeywordSelectedIndex = -1;
    };

    /*
    * AutoCompletionWidget.getLiElements():
    * Returns all Li elements contained in the widget
    * */
    this.getLiElements = function () {
        return this.jqEl.find('li');
    }

    /*
    * AutoCompletionWidget.positionWidgetUnderCaret():
    * Positions the widget under the caret of the textarea
    * For now, it shifts the coordinates to 30px down and 5px right
    * but in the near future we will shift with relative values
    * to give more flexibility and adapt font-sizes that have not
    * default values.
    * */
    this.positionWidgetUnderCaret = function () {
        let caretCoords = this.inputScreen.getCaretCoordinates();
        this.jqEl.css({
            "top":  '' + (caretCoords.top + 30) +'px',
            "left": '' + (caretCoords.left + 5) + 'px'
        });
    }

    /*
    * AutoCompletionWidget.getFirstLiElement():
    * Returns the first Li elements contained in the widget
    * */
    this.getFirstLiElement = function () {
        return this.getLiElements().first();
    }

    /*
    * AutoCompletionWidget.setLiElementSelected(pLiElement):
    * Takes a Li element (pLiElement) contained in the widget and set it to selected
    * */    
    this.setLiElementSelected = function (pLiElement) {
        pLiElement.addClass('selected_keyword');
    }

    /*
    * AutoCompletionWidget.setLiElementUnselected(pLiElement):
    * Takes a Li element (pLiElement) contained in the widget and set it to NOT selected
    * */
    this.setLiElementUnselected = function (pLiElement) {
        pLiElement.removeClass('selected_keyword');
    }

    /*
    * AutoCompletionWidget.updateContentAndShow(pKwList):
    * Updates the content of the widget by clearing its content
    * and filling it with the keyword list given in argument (pKwList).
    * Then it displays it if there is at leat one keyword, or hide it if not.
    * */
    this.updateContentAndShow = function (pKwList) {
        this.emptyContent();
        this.nbKeywords = pKwList.length;
        
        if (pKwList.length !== 0) {
            this.positionWidgetUnderCaret();
            for (keyword of pKwList) {
                this.jqEl.append($('<li>' + keyword + '</li>'));
            }

            if (this.currentKeywordSelectedIndex === -1) {
                this.setLiElementSelected(this.getFirstLiElement());
                this.currentKeywordSelectedIndex = 0;
            }

            this.show();

        } else {
            this.hide();
        }
    };

    /*
    * AutoCompletionWidget.getSelectedLiEl():
    * Returns the selected Li element in the widget
    * */
    this.getSelectedLiEl = function () {
        return $(this.getLiElements()[this.currentKeywordSelectedIndex]);
        
    }

    /*
    * AutoCompletionWidget.getSelectedKeyword():
    * Returns the selected keyword in the widget
    * */
    this.getSelectedKeyword = function () {
        return this.getSelectedLiEl().text();
    };

    /*
    * AutoCompletionWidget.selectNextKeyword():
    * Set to selected the Li element in the widget that is next to the currently
    * selected Li element, and unselect this one
    * */
    this.selectNextKeyword = function () {
        let selectedLiEl = this.getSelectedLiEl();
        let nextLiEl = selectedLiEl.next();

        if (nextLiEl.length !== 0) {
            this.setLiElementUnselected(selectedLiEl);
            nextLiEl.addClass('selected_keyword')
            this.currentKeywordSelectedIndex += 1;
        }
    };

    /*
    * AutoCompletionWidget.selectNextKeyword():
    * Set to selected the Li element in the widget that is before the currently
    * selected Li element, and unselect this one
    * */
    this.selectPreviousKeyword = function () {
        let selectedLiEl = this.getSelectedLiEl();
        let previousLiEl = selectedLiEl.prev();

        if (previousLiEl.length !== 0) {
            this.setLiElementUnselected(selectedLiEl);
            previousLiEl.addClass('selected_keyword');
            this.currentKeywordSelectedIndex -= 1;
        }
    }
}

/*******************************************************************************************
* ClickAndKeyListener:
* Object that Manages the events definition
* */
function ClickAndKeyListener(pInputScreen) {
    this.ENTER_KEY = 13;
    this.CTRL_KEY = 17;
    this.UP_KEY = 38;
    this.DOWN_KEY = 40;
    this.ESCAPE_KEY = 27;
    this.BACKSPACE_KEY = 8;
    this.END_KEY = 35;
    this.SPACE_KEY = 32;
    this.UP_KEY = 38;
    this.DOWN_KEY = 40;

    this.IsCtrlKeyIsDown = false;
    this.inputScreen = pInputScreen;

    /*
    * ClickAndKeyListener.setKeydownEventsToInputScreen(pController):
    * Definition of what to do when we press keys in the inputScreen.
    *  .  CTRL + SPACE ==> display / hide the auto-completer widget
    *  .  UP / DOWN / ENTER / BACKSPACE ==> navigation into the auto-completer widget
    *  .  ESCAPE ==> hide auto-completer widget
    * */
    this.setKeydownEventsToInputScreen = function (pController) {
        this.inputScreen.keydown((e) => {
            if (e.which === this.CTRL_KEY) {
                this.IsCtrlKeyIsDown = true;
            }

            /*
             * Ctrl key down + SPACE
             * */
            if (this.IsCtrlKeyIsDown) {
            
                if (e.which === this.SPACE_KEY) {
                    if (this.inputScreen.autoCompletionWidget.isVisible === true) {
                        this.inputScreen.autoCompletionWidget.hide();
                        this.inputScreen.autoCompletionWidget.isVisible = false;

                    } else {
                        let keywordsList = pController.getFormatedMatchkingKeywordsList();
                        this.inputScreen.autoCompletionWidget.show(keywordsList);
                        this.inputScreen.autoCompletionWidget.isVisible = true;
                    }
                }

            /*
             * Ctrl key is up and auto-completer widget is visible
             * */
            } else if (this.inputScreen.autoCompletionWidget.isVisible) {
                if (e.which === this.ESCAPE_KEY) {
                    this.inputScreen.autoCompletionWidget.hide();
                    this.inputScreen.autoCompletionWidget.isVisible = false;

                } else if (e.which === this.ENTER_KEY) {
                    let selectedKeyword = this.inputScreen.autoCompletionWidget.getSelectedKeyword();
                    let currentlyTypingWord = this.inputScreen.getCurrentlyTypingWord();
                    let inputStr = this.inputScreen.getInputStr();
                    let startText = inputStr.substring(0, this.inputScreen.getSelectionStart() - currentlyTypingWord.length);
                    let endText = inputStr.substring(this.inputScreen.getSelectionStart(), inputStr.length);
                    
                    if (selectedKeyword !== '') {
                        this.inputScreen.setContent(startText + selectedKeyword + endText);
                    
                        //need to explain that
                        if (selectedKeyword.slice(-1) === ")") {
                            this.inputScreen.putCursorAt(startText.length + selectedKeyword.length - 1);
                        } else {
                            this.inputScreen.putCursorAt(startText.length + selectedKeyword.length);
                        }
                        
                        this.inputScreen.autoCompletionWidget.hide();
                        e.preventDefault();
                    }

                } else if (e.which === this.DOWN_KEY) {
                    this.inputScreen.autoCompletionWidget.selectNextKeyword();
                    e.preventDefault();

                } else if (e.which === this.UP_KEY) {
                    this.inputScreen.autoCompletionWidget.selectPreviousKeyword();
                    e.preventDefault();
                }
            }
        });
    };

    /*
    * ClickAndKeyListener.setKeyupEventsToInputScreen():
    * Definition of what to do when we release keys in the inputScreen.
    * Very usefull to manage the navigation into the auto-completionWidget
    * */
    this.setKeyupEventsToInputScreen = function (pController) {
        this.inputScreen.keyup((e) => {

            if (this.inputScreen.autoCompletionWidget.isVisible === true && e.which !== this.UP_KEY && e.which !== this.DOWN_KEY) {
                this.inputScreen.autoCompletionWidget.updateContentAndShow(pController.getFormatedMatchkingKeywordsList());
            }

            if (e.which === this.CTRL_KEY) {
                this.IsCtrlKeyIsDown = false;
            }
        });
    };

    /*
    * ClickAndKeyListener.setkeyAndMouseEvents():
    * Set all events definitions of the ClickAndKeyListener object
    * */
    this.setkeyAndMouseEvents = function (pController, pSolver) {
        this.setKeydownEventsToInputScreen(pController);
        this.setKeyupEventsToInputScreen(pController);
    };
}

/*******************************************************************************************
* AutoCompleter:
* Controller object of the auto-completion feature.
* Manages the events setting through ClickAndKeyListener object
* */
function AutoCompleter(pTextareaEl, pList) {

    this.keywordsList = pList;
    this.inputScreen = new InputScreen(pTextareaEl);
    this.clickAndKeyListener = new ClickAndKeyListener(this.inputScreen);

    this.clickAndKeyListener.setkeyAndMouseEvents(this)
    
    /*
    * AutoCompleter.getMatchkingKeywordsList():
    * Returns an array containing all keywords contained in the pList object,
    * but only the word or that is currently typed in the inputScreen is contained
    * in the keyword or its tags.
    * */
    this.getMatchkingKeywordsList = function () {
        let currentlyTypingWord = this.inputScreen.getCurrentlyTypingWord().toLowerCase();
        return this.keywordsList.filter(el => ((el.keyword.toLowerCase().includes(currentlyTypingWord))
                                            || (el.tags.toLowerCase().includes(currentlyTypingWord))));
    }

    /*
    * Controller.getKeywordsList():
    * Returns an array containing all keywords contained in the pList object,
    * but only the word or that is currently typed in the inputScreen is contained
    * in the keyword or its tags.
    * But here, "keyword" is meant the string part before the opening parenthesis.
    * To be clear:
    * - if the keyword is a function, like "solv(VAR, EXPR)", the returned keyword in in the array
    *   will be "solv()"
    * - if the keyword isn't a function, like "Infinity", the returned keyword in the array
    *   will be "Infinity"
    * 
    * */
    this.getFormatedMatchkingKeywordsList = function () {
        let helperKeywordsList = this.getMatchkingKeywordsList();
        let retKeywords = helperKeywordsList.map((el) => {
            let indexOfOpeningParenthesis = el.keyword.indexOf('(');

            if (indexOfOpeningParenthesis !== -1) {
                return el.keyword.substring(0, indexOfOpeningParenthesis + 1) + ')';
            } else {
                return el.keyword + ' ';
            }
        });

        return (retKeywords.slice(0, 11));
    }
}