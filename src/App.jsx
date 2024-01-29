import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Register from "./Pages/Register";
import EmailVerif from "./Pages/EmailVerif";
import Login from "./Pages/Login";
import ChangePassword from "./Pages/ChangePassword";
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" Component={Register} />
				<Route path="/verification" Component={EmailVerif} />
				<Route path="/login" Component={Login} />
				<Route path="/password/reset" Component={ChangePassword} />
				<Route path="/home" Component={Home} />
				<Route path="/profile" Component={Profile} />
			</Routes>
		</Router>
	);
}

export default App;
