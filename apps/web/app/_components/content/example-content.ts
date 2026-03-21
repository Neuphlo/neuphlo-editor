const exampleContent = /* html */ `
  <h1>Welcome to Neuphlo Editor</h1>
  <p>
    A modern block editor for React, built on <a href="https://tiptap.dev">Tiptap</a>.
    Try editing this page to explore all the features below.
  </p>

  <h2>Text Formatting</h2>
  <p>
    Select any text to see the <strong>bubble menu</strong> appear. You can make text
    <strong>bold</strong>, <em>italic</em>, <u>underlined</u>,
    <s>strikethrough</s>, or <code>inline code</code>.
    You can also add <a href="https://github.com">links</a> to any text.
  </p>

  <h2>Headings</h2>
  <p>The editor supports four levels of headings. Use the slash command or the bubble menu to switch between them.</p>
  <h3>This is a Heading 3</h3>
  <h4>This is a Heading 4</h4>

  <h2>Lists</h2>
  <p>Bullet lists, numbered lists, and task lists are all supported:</p>
  <ul>
    <li>Drag handles appear on hover to reorder blocks</li>
    <li>Nest items by pressing <kbd>Tab</kbd></li>
    <li>Use the slash command to switch list types</li>
  </ul>
  <ol>
    <li>First item in a numbered list</li>
    <li>Second item — ordering is automatic</li>
    <li>Third item</li>
  </ol>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="true">Ship the new editor</li>
    <li data-type="taskItem" data-checked="true">Add drag-and-drop support</li>
    <li data-type="taskItem" data-checked="false">Write documentation</li>
    <li data-type="taskItem" data-checked="false">Celebrate launch</li>
  </ul>

  <h2>Blockquote</h2>
  <blockquote>
    The best way to predict the future is to invent it. Great editors don't just
    display content — they make creating it feel effortless.
  </blockquote>

  <h2>Code Block</h2>
  <pre><code class="language-typescript">import { Editor } from "neuphlo-editor/react";

export default function App() {
  return (
    &lt;Editor
      content="&lt;p&gt;Hello world&lt;/p&gt;"
      uploadImage={async (file) =&gt; {
        const url = await uploadToStorage(file);
        return url;
      }}
    /&gt;
  );
}</code></pre>

  <h2>Images</h2>
  <p>
    Click on an image to select it. Use the resize handles on the sides to adjust
    the width, or the toolbar above to change alignment. Try uploading your own
    image using the slash command.
  </p>
  <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" alt="Mountain landscape" />

  <h2>Tables</h2>
  <p>
    Hover over a table to see column and row grips. Click a grip to access options
    like insert, delete, or toggle headers. Drag grips to reorder rows or columns.
  </p>
  <table>
    <tr>
      <th>Feature</th>
      <th>Status</th>
      <th>Notes</th>
    </tr>
    <tr>
      <td>Rich text formatting</td>
      <td>Ready</td>
      <td>Bold, italic, underline, strike, code</td>
    </tr>
    <tr>
      <td>Slash commands</td>
      <td>Ready</td>
      <td>Type <code>/</code> to insert any block type</td>
    </tr>
    <tr>
      <td>Image blocks</td>
      <td>Ready</td>
      <td>Upload, resize, and align images</td>
    </tr>
    <tr>
      <td>Table editing</td>
      <td>Ready</td>
      <td>Add/remove rows and columns, drag to reorder</td>
    </tr>
    <tr>
      <td>Drag handles</td>
      <td>Ready</td>
      <td>Reorder any block with drag and drop</td>
    </tr>
  </table>

  <h2>Mentions</h2>
  <p>
    Type <code>@</code> followed by a name to mention someone. Try it — type
    <code>@</code> right here to see the suggestion list.
  </p>

  <h2>Slash Commands</h2>
  <p>
    Press <code>/</code> on an empty line to open the command menu. From there you
    can insert headings, lists, images, videos, tables, code blocks, and more.
    Start typing to filter the options.
  </p>

  <hr />

  <p>
    Built with Tiptap, React, and TypeScript. Designed to be minimal, composable,
    and ready to ship.
  </p>
`

export default exampleContent
