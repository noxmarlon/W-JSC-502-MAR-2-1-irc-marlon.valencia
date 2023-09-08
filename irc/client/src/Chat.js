import React, { Component} from 'react';
import './Chat.css';
import 'emoji-mart/css/emoji-mart.css'

class Chat extends Component {
    constructor() {
        super();

        this.state = {
            commands: [
                "create",
                "join",
                "leave",
                "delete",
                "change",
                "users",
                "list",
                "where",
                "msg",
                "nick"
            ]
        }
    }

    /**
     * 
     */
    componentDidMount() {
        this.props.socket.on('chat message', (newUser, msg, color, tab) => {
            console.log(msg)
            this.createMessage(newUser, msg, color, tab);
            const el = document.getElementById('chat-messages');
            el.scrollTop = el.scrollHeight;
            
        });

        this.props.socket.on('RedirectDelete', () => {
            this.props.socket.emit('RedirectDelete');
        });

        this.props.socket.on("private", function(msg) {
            this.props.socket.emit('private', msg);
        });
    }
 
    /**
     * 
     */
    handleSubmit = (event) => {
        event.preventDefault();

        var msg = event.target[0].value.split(" ");
        
        if(this.isCommand(msg[0])) {
            this.executeCommand(msg[0].substr(1), msg.filter((item) => item !== msg[0]));
        } else {
            this.props.socket.emit('chat message', event.target[0].value);
        }
        
        event.target[0].value = "";
    }

    /**
     * 
     */
    isCommand(string) {
        if(string[0] === "/" && this.state.commands.indexOf(string.substr(1)) !== -1) {
            return true;
        }

        return false;
    }

    /**
     * 
     */
    executeCommand(command, options = null) {
        command = "Command" + command.charAt(0).toUpperCase() + command.substring(1).toLowerCase();

        if(options != null) {
            this.props.socket.emit(command, options);
        } else {
            this.props.socket.emit(command);
        }
    }

    /**
     * 
     */
    createMessage(user, msg, color, options = []) {
        var message = document.createElement('div');
        message.className = "message";

        var span = document.createElement('span');
        span.id = "span-user";
        span.innerHTML = user;
        span.style.color = color;

        message.appendChild(span);

        var text = document.createElement('p');
        text.className = "content";
        text.innerHTML = msg;

        message.appendChild(text);

        this.createOptions(message, options);

        var parent = document.getElementById('chat-messages');
        parent.appendChild(message);
    }

    /**
     * 
     */
    createOptions(parent, options) {
        var ul = document.createElement('ul');
        ul.className = "ul-channel";

        for(var i in options) {
            var li = document.createElement('li');

            li.innerHTML = options[i];
            ul.appendChild(li);
        }

        parent.appendChild(ul);
    }

    addEmoji(emoji) {
        const text = emoji.native;

        var chat = document.getElementById('chat-message');
        chat.value += text;
    }

    render() {
        return(
            <div id="chat">
                <div id="chat-messages">
                </div>

                <form id="chat-form" action="" onSubmit={this.handleSubmit}>
                    <input
                        id="chat-message"
                        placeholder="Envoyer un message"
                        autoComplete="off"
                    />
                </form>
            </div>
        )
    }
}

export default Chat;