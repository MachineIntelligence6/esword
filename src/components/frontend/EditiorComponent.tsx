import { useRef, useEffect } from 'react';

const Editor = () => {
  const wysiwygRef = useRef(null);

  useEffect(() => {
    const initEditor = () => {
      if (!wysiwygRef.current) return;
      const wysiwygDocument = (wysiwygRef.current as any).contentDocument;
      if (!wysiwygDocument) return;

      // Add CSS
      const styleElement = wysiwygDocument.createElement('style');
      styleElement.innerHTML = `
          *, ::after, ::before {box-sizing: border-box;}
          :root {tab-size: 4;}
          html {line-height: 1.15;text-size-adjust: 100%;}
          body {margin: 0px; padding: 1rem 0.5rem;}
          body {font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";}
        `;
      wysiwygDocument.head.appendChild(styleElement);

      // Set initial content
      wysiwygDocument.body.innerHTML = `
          <h1>Hello World!</h1>
          <p>Welcome to the pure AlpineJS and Tailwind WYSIWYG.</p>
        `;

      // Make editable
      wysiwygDocument.designMode = 'on';
    };

    initEditor();
  }, []);

  const format = (cmd: string, param: string | null = null) => {
    if (wysiwygRef.current) {
      (wysiwygRef.current as any).contentDocument?.execCommand(cmd, false, param);
    }
  };

  return (
    <div className="flex w-full">
      <div className="bg-gray-200 w-full flex items-center justify-center">
        <div className="bg-white w-full text-black border-b" x-data="app()">
          <div className="overflow-hidden px-1">
            <div className="flex border-b w-full min-w-full border-gray-200 text-xl text-gray-600 flex-wrap py-[10px]">
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('bold')}
              >
                <i className="mdi mdi-format-bold"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('italic')}
              >
                <i className="mdi mdi-format-italic"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 mr-1 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('underline')}
              >
                <i className="mdi mdi-format-underline"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('formatBlock', 'P')}
              >
                <i className="mdi mdi-format-paragraph"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('formatBlock', 'H1')}
              >
                <i className="mdi mdi-format-header-1"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('formatBlock', 'H2')}
              >
                <i className="mdi mdi-format-header-2"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 mr-1 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('formatBlock', 'H3')}
              >
                <i className="mdi mdi-format-header-3"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('insertUnorderedList')}
              >
                <i className="mdi mdi-format-list-bulleted"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 mr-1 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('insertOrderedList')}
              >
                <i className="mdi mdi-format-list-numbered"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('justifyLeft')}
              >
                <i className="mdi mdi-format-align-left"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('justifyCenter')}
              >
                <i className="mdi mdi-format-align-center"></i>
              </button>
              <button
                className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                onClick={() => format('justifyRight')}
              >
                <i className="mdi mdi-format-align-right"></i>
              </button>
            </div>
            <div className="w-full">
              <iframe
                ref={wysiwygRef}
                className="w-full h-96 overflow-y-auto"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;





