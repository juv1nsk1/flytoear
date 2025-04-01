import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Checkin } from "./screens/airline/checkin";
import { Navbar } from "./screens/navbar";
import { ProofTravel } from "./screens/airline/prooftravel";
import { MileBalance } from "./screens/airline/balance";
import { Expire } from "./screens/airline/expire";
import { Borrow } from "./screens/lender/borrow";
import { Repay } from "./screens/lender/repay";
import { Stake } from "./screens/invest/stake";
import { Unstake } from "./screens/invest/unstake";

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
      <Route path="/" element={<Checkin />}/>
      <Route path="/airline/checkin" element={<Checkin />} />
      <Route path="/airline/prooftravel" element={<ProofTravel />}/>
      <Route path="/airline/balance" element={<MileBalance />}/>
      <Route path="/airline/expire" element={<Expire />}/>
      <Route path="/lend/borrow" element={<Borrow />}/>
      <Route path="/lend/repay" element={<Repay />}/>
      <Route path="/invest/stake" element={<Stake />}/>
      <Route path="/invest/unstake" element={<Unstake />}/>
      
      </Routes>
    </BrowserRouter>

  )
}
export default App;