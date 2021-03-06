const React = require('react-native')
const Search = require('../containers/Search')
const LoginError = require('./LoginError')
let simpleAuthClient = require('react-native-simple-auth');
const host = !process.env.DEPLOYED ? 'http://104.236.40.104/' : 'http://localhost:3000/'
var { Icon, } = require('react-native-icons');

const MK = require('react-native-material-kit')
const {
  MKButton,
  MKColor,
  mdl,
  MKTextField,
  MKCardStyles
} = MK;

MK.setTheme({
  primaryColor: MKColor.Blue,
  accentColor: MKColor.Orange,
});




const {
  StyleSheet,
  ListView,
  NetInfo,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  Image,
  Modal,
  Animated
} = React

var API_KEY_FACEBOOK_APP = require('../../apikeys').facebook_app_api_key;

const Login = React.createClass({
  getInitialState: function() {
    return {
      // animated: false,
      // visible: true,
      // transparent: true
    }
  },

  componentDidMount: function(){
    simpleAuthClient.configure('facebook', {
      app_id: API_KEY_FACEBOOK_APP
    }).then(() => {
      // Twitter is configured.
      console.log('facebook configured successfully')

    })

 
  },

  auth: function(){
    console.log(simpleAuthClient)

    simpleAuthClient.authorize('facebook').then((info) => {
  
    console.log('facebook data', info)

    var url = `${host}api/users`;
    console.log(url);

    var obj = {  
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'user_id': info['id'],
        'user_first_name': info['first_name'],
        'user_last_name': info['last_name'],
        'user_email': info['email']
      })
    }

    fetch(url, obj)
    .then((response) => 
      response.json()
    )
    .then((responseData) => {
      this.props.user_set(responseData[0]['id'], info['last_name'],info['first_name'], info['email']);

          this.props.navigator.push({
              title: 'Search',
              component: Search
            });
        }).catch((error) => {
          console.log('ERR', error)
          let errorCode = error.code;
          let errorDescription = error.description;
        });
    }).catch((error) =>{
      console.log('outter error', error);
      this.props.navigator.push({
        title: 'LoginError',
        component: LoginError
      });
    })
    .done();


 

//     simpleAuthClient.authorize('google-web').then((info) => {
//   console.log('google auth works', info)
// }).catch((error) => {
//   console.log('ERR', error)
//   let errorCode = error.code;
//   let errorDescription = error.description;
// });
  },

  //should navigate to search page depending on login status. might need to change this later to be
  //a call of {{this.login()}} should happen in render, making a check to redux state.
  login: function(){
    this.props.navigator.push({
      title: 'Search',
      component: Search
    });
  },

  render: function() {

    return (

        <View style = {styles.mainContainer}>

          <Text style= {styles.title}> WAYD </Text>
          {/*  
          <Textfield1 value={this.state.username}/>
          <Textfield2 value={this.state.username}/>
          <Text style= {styles.buttonText}> or </Text>
          */}


          <MKButton
            backgroundColor={MKColor.blue1}
            style={styles.facebook}
            shadowRadius={2}
            shadowOffset={{width:0, height:1}}
            shadowOpacity={.7}
            shadowColor="black"
            onPress={() => {
              this.auth()
              console.log('login btn!');
            }}
            >

            <Icon
              name='material|facebook'
              size={44}
              color='white'
              style={styles.facebook}
            />
            
          </MKButton>


         </View>
    )
  }
})


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 30,
    marginTop: 65,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  title: {
    marginBottom: 20,
    fontSize: 25,
    fontFamily: 'Bebas',
    textAlign: 'center',
    color: 'black'
  },
  searchInput: {
    height: 50,
    padding: 4,
    marginBottom: 10,
    marginRight: 5,
    fontSize: 23,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    color: 'white'
  },
  facebook: {
    height: 80,
    width: 80,
    backgroundColor: '#304FFE',
    borderRadius: 40,
    alignSelf: 'center',
    flex: 0,
    justifyContent: 'flex-end',
     shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    }
  },
  buttonText: {
    fontSize: 15,
    color: '#111',
    alignSelf: 'center'
  },
  button: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#304FFE',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 0,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  textfield: {
    height: 28,  // have to do it on iOS
    marginTop: 22,
  },
    spinnerContainer: {
    flex: 1,
    padding: 0,
    marginTop: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#ECEFF1'
  }
});


const Textfield1 = MKTextField.textfield()
  .withPlaceholder('username...')
  .withStyle(styles.textfield)
  .build();

const Textfield2 = MKTextField.textfield()
  .withPlaceholder('password...')
  .withStyle(styles.textfield)
  .build();


module.exports = Login
