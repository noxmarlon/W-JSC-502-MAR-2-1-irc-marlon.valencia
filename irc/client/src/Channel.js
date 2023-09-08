import React,{Component} from 'react';


const ListItem = function(props) {
    return <li>{props.item}</li>
}

class Channel extends Component {
    constructor() {
        super();

        this.state = {
            channels: []
        }
    }

    componentDidMount() {
        this.props.socket.on('addRoom', (room) => {
            this.setState({
                channels: this.state.channels.concat(room)
            });
        });
    }


    createList() { 
        return this.state.channels.map(item => {
            return  <ListItem item={item} />
        });
    }

    render() {
        return(
            <div id="channels">
                <ul id="channels-list">
                    {this.createList()}
                </ul>
            </div>
        );
    }
}

export default Channel;