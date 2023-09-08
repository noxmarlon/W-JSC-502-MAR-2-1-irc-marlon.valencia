import React, { Component} from 'react';

class Login extends Component {
    
    handleSubmit = (event) => {
        event.preventDefault();
        this.props.socket.emit('login', event.target[0].value);
    }

    render() {

        return(
            <div id="login">
                <h2>Se connecter à IRC</h2>
                <form id="login-form" action="" onSubmit={this.handleSubmit}>
                    <input id="username" type="text" name="username" placeholder="Pseudo"/>
                    <button>Valider</button>
                </form>
            </div>
        )
    }
}  

export default Login;