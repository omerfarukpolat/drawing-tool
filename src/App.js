import {Layout} from 'antd';
import './App.css';
import HomeContainer from "./containers/HomeContainer";



const App = () => {
  return (
      <Layout className={'layout'}>
        <HomeContainer />
      </Layout>
  );
}



export default App;
