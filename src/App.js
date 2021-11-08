
import SignUpForm from './SignUpForm';
import UserPage from './UserPage';
//import LoginForm from './LoginForm'
import { useState } from 'react';
import './App.css';



function App() {
  
  const [isLoggedIn, setLoginStatus] = useState(window.localStorage.getItem('token'))
  
  

  async function logout(){    
    window.localStorage.removeItem('token');
    console.log(window.localStorage.getItem('token'))
    setLoginStatus(false);    
  }
  
  

  // if(hasAccount){
  //   return (
  //     <LoginForm />
  //   )
  // }


  return (
    <div style={{ marginLeft:"50px" }}className="App">      
    { isLoggedIn ? <button style={{ marginLeft:"50%", color:"red", marginTop:"10px", width:"100px", height:"30px"}} onClick={logout}> Logout </button> : null }
      { isLoggedIn ? <UserPage /> : <SignUpForm /> }      
      {/* { !isLoggedIn ? <button onClick={() => setHasAccount(true)}> Already have an account ?</button> : null} */}      
    </div>
    
  );
}

export default App;
