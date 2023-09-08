import React, { Component } from 'react';
import io from 'socket.io-client';
import Login from './Login';
import UsersList from './UsersList';
import Chat from './Chat';
import './App.css';
import'./Channel.js';
import Channel from './Channel.js';

class App extends Component {
    constructor() {
        super();

        this.state = {
            socket: io('http://localhost:3001'),
            avatar: null,
            user: '',
            courantLogged: false
        };
    }

    componentDidMount() {
        this.state.socket.on('logged', (newUser) => {
            this.setState({
                user: newUser,
                courantLogged: true
            });
        });

        this.state.socket.on('error message', (message) => {
            alert(message);
        });
    }

    render() {
        return (
            <div className='app'>
                <div className='idbar'>
                    <h1>Irc Chat</h1>
                </div>
                <div className='app-content'>
                    {this.state.courantLogged &&
                        <> 
                            <UsersList socket={this.state.socket} />
                            <Chat socket={this.state.socket} />
                            <div id="commands" >
                            <ul>
                            <h1>Commands</h1>
                                
                                <li><strong> /nick [nickname] :</strong> définit le surnom de l’utilisateur au sein du serveur</li>
                                <li><strong>/list [string] :</strong>  liste les channels disponibles sur le serveur</li>
                                <li><strong>/create [channel] :</strong>  créer un channel sur le serveur.</li>
                                <li><strong>/delete [channel] :</strong>  suppression du channel sur le serveur</li>
                                <li><strong>/join [channel] :</strong>  rejoins le channel sur le serveur</li>
                                <li><strong>/leave [channel] :</strong>  quitte le channel sur le serveur</li>
                                <li><strong>/msg [channel] [message] :</strong>  envoie un message sur le channel</li>
                                <li><strong>/change [channel] [new channel] :</strong>  Changer vers new channel </li>
                            </ul>
                            </div>
                        </>
                    }

                    {!this.state.courantLogged &&
                        < Login
                            socket={this.state.socket}
                            courantLogged={this.state.courantLogged}
                        />
                    }
                </div>
            </div>
        );
    }
}

export default App;