import React, { Component } from 'react';
import './UserList.css';
import './Channel.js';
import Channel from './Channel.js';

const ListItem = function (props) {
    return <li>{props.item}</li>
}

class UsersList extends Component {
    constructor() {
        super();

        this.state = {
            users: []
        }
    }

    componentDidMount() {
        this.props.socket.on('newUser', (newUser) => {
            this.addUser(newUser);
        });

        this.props.socket.on('removeUser', (user) => {
            this.deleteUser(user);
        });

        this.props.socket.on('initUsers', (users) => {
            var tabUsers = [];

            for (var i in users) {
                tabUsers.splice(1, 0, users[i].name);
            }

            this.setState({
                users: tabUsers
            })
        });
    }

    createList() {
        return this.state.users.map((item, index) => {
            return <ListItem item={item} key={index} />
        });
    }

    addUser(newUser) {
        this.setState({
            users: this.state.users.concat(newUser)
        });
    }

    deleteUser(user) {
        this.setState({
            users: this.state.users.filter((pUser) => pUser !== user)
        });
    }
  
    render() {
        return (
            <div id="users">
                <h2>UTILISATEURS</h2>
                <ul id="users-list">
                    {this.createList()}
                    <h1>Channel</h1>
                   <Channel socket= {this.props.socket} />
                   
                </ul>
                
            </div>
            
        )
    }
}

export default UsersList;