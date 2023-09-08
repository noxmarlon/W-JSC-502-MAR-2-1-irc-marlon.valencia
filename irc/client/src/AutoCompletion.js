import React, {Component} from 'react';

class AutoCompletion extends Component {
    constructor() {
        super();

        this.state = {
            isActive: false,
            completion: {
                commands: [],
                users: [],
                channels: []
            } 
        }
    }

    ActiveCompletion(string) {
        if(this.isCommand(string)) {

        }
    }

    isCommand(string) {
        var test = string.split(" ");
        
        if(test.length == 1 && test[0] == "/") {
            return true;
        } else {
            return false
        }
    }

    render() {
        return(
            <div>
            </div>
        );
    }
}