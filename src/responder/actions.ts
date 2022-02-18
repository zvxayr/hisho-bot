import { Message } from 'discord.js';

type MessageAction = (message: Message) => void;

const Send = (text: string): MessageAction => (message) => {
    message.channel.send(text);
};

const Reply = (text: string): MessageAction => (message) => {
    message.reply(text);
};

const React = (emoji: string): MessageAction => (message) => {
    message.react(emoji);
};

const Delete = (): MessageAction => (message) => {
    message.delete();
};

export { MessageAction };
export {
    Send,
    Reply,
    React,
    Delete,
};
