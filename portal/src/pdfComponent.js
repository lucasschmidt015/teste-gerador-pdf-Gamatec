// import '../../styles/EmailComponent.scss';

import { Editor } from '@tinymce/tinymce-react';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';

import React, { useEffect, useRef, useState } from 'react';

const PDFComponent = ({
  input: { value, onChange }, meta: { touched, error }, placeHolder, handleCopy, handlePaste, componentName, variables,
}) => {
  const [editorContent, setEditorContent] = useState(value);
  const [style, setStyle] = useState({ active: false });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({});
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [startPos, setStartPos] = useState(0);

  const suggestionBoxRef = useRef(null);
  const showSuggestionsRef = useRef(showSuggestions);
  const suggestionsRef = useRef(suggestions);
  const activeSuggestionRef = useRef(activeSuggestion);

  const handleError = () => {
    const styles = error ? {
      border: '1px solid red', active: true,
    } : { active: false };
    setStyle(styles);
  };

  useEffect(() => {
    if (touched === true) {
      handleError();
    }
  }, [touched]);

  useEffect(() => {
    setEditorContent(value);
  }, [value]);

  useEffect(() => {
    showSuggestionsRef.current = showSuggestions;
  }, [showSuggestions]);

  useEffect(() => {
    suggestionsRef.current = suggestions;
  }, [suggestions]);

  useEffect(() => {
    activeSuggestionRef.current = activeSuggestion;
  }, [activeSuggestion]);

  const handleEditorChange = (content, editor) => {
    setEditorContent(content);
    onChange(content);
    handleError();
  };

  const filterSuggestions = (input) => {
    if (!variables || variables.length === 0) {
      return;
    }

    const recivedVariables = variables.map(v => v.name);

    const filtered = recivedVariables.filter(variable => variable.includes(input));

    if (!filtered.length) {
      setShowSuggestions(false);
    }

    setSuggestions(filtered);
  };

  const showSuggestionList = (editor, position) => {
    if (!variables || variables.length === 0) {
      return;
    }

    const recivedVariables = variables.map(v => v.name);

    setStartPos(position - 1);
    setSuggestions(recivedVariables);
    setShowSuggestions(true);
    const { top, left } = editor.selection.getBoundingClientRect();
    setCursorPosition({ top: top + 67, left });
  };

  const handleKeyPress = (event, editor) => {
    if (event.key === '$') {
      showSuggestionList(editor);
    }
  };

  const handleKeyDown = (event) => {
    if (showSuggestionsRef.current) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveSuggestion(prev => (prev + 1) % suggestionsRef.current.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveSuggestion(prev => (prev - 1 + suggestionsRef.current.length) % suggestionsRef.current.length);
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        insertVariable(suggestionsRef.current[activeSuggestionRef.current]);
        setActiveSuggestion(0);
      } else if (event.key === 'Escape') {
        setShowSuggestions(false);
        setActiveSuggestion(0);
      }
    }
  };

  const handleKeyUp = (event) => {
    const keyCodesToHideSuggestions = ['Space', 'Enter', 'Backspace', 'ArrowRight', 'ArrowLeft'];

    if (keyCodesToHideSuggestions.includes(event.code)) {
      setShowSuggestions(false);
    }

    const editor = tinymce.activeEditor;
    const content = editor.getContent({ format: 'text' });
    const position = editor.selection.getRng().startOffset;

    // Get the current line's content using TinyMCE API
    const container = editor.selection.getRng().startContainer;
    const text = container.textContent || container.innerText;

    const currentLineStart = text.lastIndexOf('\n', position - 1) + 1;
    const currentLineEnd = text.indexOf('\n', position);
    const currentLine = text.substring(currentLineStart, currentLineEnd === -1 ? text.length : currentLineEnd);

    if (event.code === 'Backspace') {
      for (let i = position - 1; i >= currentLineStart; i--) {
        const charAtPosition = text[i];

        if (charAtPosition.trim() === '') {
          setShowSuggestions(false);
          break;
        }

        if (charAtPosition.trim() === '$') {
          showSuggestionList(editor);
          break;
        }
      }
    }

    if (!content.length) {
      setShowSuggestions(false);
    }

    if (showSuggestionsRef.current) {
      const finalPosition = position;
      let startPosition;
      let isVariable = false;

      for (let i = finalPosition - 1; i >= currentLineStart; i--) {
        const charAtPosition = text[i];

        if (charAtPosition.trim() === '') {
          break;
        }

        if (charAtPosition.trim() === '$') {
          isVariable = true;
          startPosition = i;
          break;
        }
      }

      if (isVariable) {
        const finalString = currentLine.substring(startPosition - currentLineStart, finalPosition - currentLineStart);
        filterSuggestions(finalString);
        if (!finalString.length) {
          setShowSuggestions(false);
        }
      }
    }
  };

  const uploadImageFile = (file, success, failure, progress) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      success(base64Data);
    };
    reader.onerror = (error) => {
      failure('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (blobInfo, success, failure, progress) => {
    if (blobInfo.blob()) {
      uploadImageFile(blobInfo.blob(), success, failure, progress);
    } else {
      failure('No file to upload');
    }
  };

  const setupEditor = (editor) => {
    editor.on('keypress', event => handleKeyPress(event, editor));
    editor.on('keydown', handleKeyDown);
    editor.on('keyup', handleKeyUp);
    editor.on('click', () => setShowSuggestions(false));
    editor.on('init', function (editor) {
      this.getBody().style.fontSize = '12px';
    });

    editor.ui.registry.addButton('customImageButton', {
      icon: 'image',
      tooltip: 'Insert image',
      onAction: () => {
        editor.windowManager.open({
          title: 'Carregar Imagem',
          body: {
            type: 'panel',
            items: [
              {
                type: 'htmlpanel',
                html: `
                  <input type="file" accept="image/*" id="uploadImage" />
                  <div id="previewImage" style="margin-top: 10px;"></div>
                `,
              },
            ],
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Cancelar',
            },
            {
              type: 'submit',
              text: 'Adicionar',
              primary: true,
            },
          ],
          onSubmit: (api) => {
            const input = document.getElementById('uploadImage');
            const file = input.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                editor.insertContent(`<img src="${e.target.result}" />`);
                api.close();
              };
              reader.readAsDataURL(file);
            } else {
              api.close();
            }
          },
        });
      },
    });

    if (handleCopy) {
      editor.ui.registry.addButton('customCopyButton', {
        icon: 'copy',
        tooltip: 'Copiar',
        onAction: () => {
          handleCopy(componentName);
        },
      });
    }

    if (handlePaste) {
      editor.ui.registry.addButton('customPasteButton', {
        icon: 'paste',
        tooltip: 'Colar',
        onAction: () => {
          handlePaste(componentName);
        },
      });
    }
  };

  const insertVariable = (variable) => {
    const editor = tinymce.activeEditor;
    const content = editor.getContent({ format: 'html' });
    const position = editor.selection.getRng().startOffset;

    // Get the current line's content using TinyMCE API
    const container = editor.selection.getRng().startContainer;
    const text = container.textContent || container.innerText;
    // Calculate start and end positions of the current line within the entire content
    const currentLineStart = text.lastIndexOf('\n', position - 1) + 1;
    const currentLineEnd = text.indexOf('\n', position);
    const currentLine = text.substring(currentLineStart, currentLineEnd === -1 ? text.length : currentLineEnd);

    let startPosition;
    for (let i = position - 1; i >= currentLineStart; i--) {
      const charAtPosition = text[i];

      if (charAtPosition.trim() === '$') {
        startPosition = i;
        break;
      }
    }

    if (startPosition !== undefined) {
      const textBeforeCursor = currentLine.substring(0, startPosition - currentLineStart);
      const textAfterCursor = currentLine.substring(position - currentLineStart);

      // Update the container's text content with the updated line content
      container.textContent = textBeforeCursor + variable + textAfterCursor;

      // Move the cursor to the correct position
      const range = editor.dom.createRng();
      const newCursorPosition = startPosition + variable.length;
      range.setStart(container, newCursorPosition);
      range.setEnd(container, newCursorPosition);
      editor.selection.setRng(range);
    }

    setActiveSuggestion(0);
    setShowSuggestions(false);
    editor.focus();
  };

  const handleClickOutside = (event) => {
    if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div style={style}>
        <Editor
          value={editorContent}
          init={{
            height: 450,
            menubar: false,
            plugins: [
              'advlist autolink lists link image imagetools charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount',
            ],
            toolbar:
          'undo redo | fontsizeselect | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | '
          + 'bullist numlist outdent indent | removeformat | customImageButton | customCopyButton | customPasteButton',
            fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
            images_upload_handler: handleImageUpload,
            images_upload_base_path: '/uploads',
            images_upload_credentials: true,
            image_dimensions: false,
            imagetools_toolbar: 'rotateleft rotateright | flipv fliph | editimage imageoptions',
            setup: setupEditor,
            statusbar: false,
            placeholder: placeHolder || 'Monte o corpo de seu email aqui...',
            deprecation_warnings: false,
            content_style: 'body, p, div { font-size: 12pt; }', // Apply font size to body, p, and div elements
          }}
          onEditorChange={handleEditorChange}
          onBlur={handleError}
        />
      </div>
      {
        style.active && error !== undefined ? (
          <label style={{ color: '#97aab7', fontSize: 14 }}>{error[0]}</label>
        ) : null
      }
      {showSuggestions && (
        <div
          ref={suggestionBoxRef}
          className="suggestion-dropdown"
          style={{ position: 'absolute', top: `${cursorPosition.top}px`, left: `${cursorPosition.left}px` }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
              onClick={() => insertVariable(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDFComponent;