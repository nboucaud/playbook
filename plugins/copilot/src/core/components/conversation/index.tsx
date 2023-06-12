import { clsx } from 'clsx';
import type { MessageType } from 'langchain/schema';
import { marked } from 'marked';
import { type ReactElement, useMemo } from 'react';

import {
  aiMessageStyle,
  conversationStyle,
  humanMessageStyle,
} from './index.css';

export interface ConversationProps {
  type: MessageType;
  text: string;
}

export const Conversation = (props: ConversationProps): ReactElement => {
  const html = useMemo(() => marked.parse(props.text), [props.text]);
  return (
    <div
      className={clsx(conversationStyle, {
        [aiMessageStyle]: props.type === 'ai',
        [humanMessageStyle]: props.type === 'human',
      })}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></div>
  );
};
