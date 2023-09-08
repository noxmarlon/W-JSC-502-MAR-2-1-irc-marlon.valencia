import React, { Component} from 'react';
import './Message.css';

class Message extends Component {
    constructor() {
        super();

        this.state = {
            avatar: null,
            user: null,
            content: null,
            date: null
        }
    }
  
    render() {
        return(
            <div class="message">
                <span>{this.state.user}</span>

                <p class="content">
                    {this.state.content}
                </p>
            </div>
        )
    }
}

export default Message;