import ExampleTheme from "./themes/ExampleTheme";
import {
    InitialConfigType,
    LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { createHeadlessEditor } from "@lexical/headless";

import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import "./styles.scss";
import "./index.scss";
import { LexicalEditor, SerializedEditorState } from "lexical";
import { useEffect, useMemo, useState } from "react";
import { EditorState } from "lexical";
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
} from "@lexical/markdown";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { Box } from "@mui/system";

function Placeholder() {
    return <div className="editor-placeholder">Enter some rich text...</div>;
}

type ControlledRTP =
    | {
          height?: number;
          mode: "json";
          value: SerializedEditorState;
          onChange: (value: SerializedEditorState) => void;
      }
    | {
          height?: number;
          mode: "markdown" | "html";
          value: string;
          onChange: (value: string) => void;
      };

type UncontrolledRTP = {
    height?: number;
};

export type RichTextProps = ControlledRTP | UncontrolledRTP;

function isControlled(props: RichTextProps): props is ControlledRTP {
    return Object.keys(props).includes("mode");
}

export default function RichTextEditor(props: RichTextProps) {
    const editorConfig: InitialConfigType = {
        // The editor theme
        theme: ExampleTheme,
        // Handling of errors during update
        onError(error: any) {
            throw error;
        },
        // Any custom nodes go here
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode,
        ],
        namespace: "rich-editor",
    };

    const [state, setState] = useState<EditorState>();
    const [editor, setEditor] = useState<LexicalEditor>();

    useEffect(() => {
        if (editor && state) {
            if (isControlled(props)) {
                switch (props.mode) {
                    case "json":
                        editor.setEditorState(state);
                        props.onChange(state.toJSON());
                        break;
                    case "markdown":
                        editor.setEditorState(state);
                        state.read(() => {
                            let converted =
                                $convertToMarkdownString(TRANSFORMERS);
                            if (
                                converted.endsWith(" ") ||
                                converted.endsWith("\n")
                            ) {
                                return;
                            }
                            props.onChange(converted);
                        });
                        break;
                    case "html":
                        editor.setEditorState(state);
                        state.read(() => {
                            let converted = $generateHtmlFromNodes(editor);
                            if (
                                converted.endsWith(" ") ||
                                converted.endsWith("\n")
                            ) {
                                return;
                            }
                            props.onChange(converted);
                        });
                        break;
                }
            }
        }
    }, [editor, state]);

    useEffect(() => {
        if (isControlled(props) && editor && state) {
            switch (props.mode) {
                case "json":
                    let newState = editor.parseEditorState(props.value);
                    if (JSON.stringify(newState) !== JSON.stringify(state)) {
                        setState(newState);
                        editor.setEditorState(newState);
                    }
                    break;
                case "markdown":
                    editor.update(() => {
                        $convertFromMarkdownString(props.value);
                        setState(editor.getEditorState());
                    });
                    break;
                case "html":
                    editor.update(() => {
                        $generateNodesFromDOM(
                            editor,
                            new DOMParser().parseFromString(
                                props.value,
                                "text/html"
                            )
                        );
                        setState(editor.getEditorState());
                        console.log("SET", props.value);
                    });
                    break;
            }
        }
    }, [props]);

    return (
        <Box
            className="rich-text-editor"
            sx={{ height: props.height ?? "50vh" }}
        >
            <LexicalComposer initialConfig={editorConfig as any}>
                <div className="editor-container">
                    <ToolbarPlugin />
                    <div className="editor-inner">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable className="editor-input" />
                            }
                            placeholder={<Placeholder />}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <CodeHighlightPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <AutoLinkPlugin />
                        <ListMaxIndentLevelPlugin maxDepth={7} />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        <OnChangePlugin
                            onChange={(state, editor) => {
                                setState(state);
                                setEditor(editor);
                            }}
                        />
                    </div>
                </div>
            </LexicalComposer>
        </Box>
    );
}
