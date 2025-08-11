import { useRef } from "react";

function AdminLogin() {
    const emailInputRef = useRef();
    const passwordInputRef = useRef();
    console.log("emailInputRef, passwordInputRef",emailInputRef, passwordInputRef);

    function submitHandler (event) {
        event.preventDefault();

        const enteredEmail = emailInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;

        const authData = {
            email : enteredEmail,
            password : enteredPassword
        }
        // props.onLogin(authData);
        console.log(authData);

        fetch(
            'http://localhost:8000/admin/login',
            {
                method: 'POST',
                body: JSON.stringify(authData),
                headers: {
                    'Content-Type' : 'application/json'
                }
            }
        )
    }

    return (
            <form onSubmit={submitHandler}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id='email' ref={emailInputRef} required/>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="text" id='password' ref={passwordInputRef} required/>
                </div>
                <div>
                    <button>Login</button>
                </div>
            </form>
    )
}

export default AdminLogin;