import React from 'react';
import { useAuthenticator, Authenticator, useTheme, View, Text, Heading, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { signUp, SignUpInput } from 'aws-amplify/auth';
import AWS from 'aws-sdk';

interface CustomAuthenticatorProps {
  children: (props: { signOut?: () => void; user?: any }) => React.ReactNode;
}

const components = {
  Header() {
    return null;
  },

  Footer() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.medium}>
        <Text color={tokens.colors.neutral[80]} className="text-sm opacity-70">
          &copy; All Rights Reserved
        </Text>
      </View>
    );
  },

  SignIn: {
    Header() {
      return (
        <View textAlign="center" className="relative pb-6">
          {/* Floating stars */}
          <div className="absolute top-4 left-12 text-xl animate-float opacity-70" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute top-8 right-16 text-xl animate-float opacity-70" style={{ animationDelay: '0.8s' }}>✨</div>
          <div className="absolute top-20 left-20 text-xl animate-float opacity-70" style={{ animationDelay: '1.2s' }}>⭐</div>
          
          {/* Main image */}
          <div className="w-48 h-48 mx-auto relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 blur-xl opacity-50"></div>
            <img
              src="/assets/empty_light.svg"
              alt="Welcome back"
              className="relative w-full h-full object-contain"
            />
          </div>

          <Heading level={3} className="text-2xl font-bold px-6">
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Welcome Back Friend! 👋
            </span>
          </Heading>
        </View>
      );
    },
    Footer() {
      const { toForgotPassword, toSignUp } = useAuthenticator();

      return (
        <View textAlign="center" className="space-y-2">
          <Button
            onClick={toForgotPassword}
            className="text-base font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Forgot Password? Don't Worry! 😊
          </Button>
          <Button
            onClick={toSignUp}
            className="text-base font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            New Friend? Sign Up Here! 🌟
          </Button>
        </View>
      );
    },
  },

  SignUp: {
    Header() {
      return (
        <View textAlign="center" className="relative pb-6">
          {/* Floating stars */}
          <div className="absolute top-4 left-12 text-xl animate-float opacity-70" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute top-8 right-16 text-xl animate-float opacity-70" style={{ animationDelay: '0.8s' }}>✨</div>
          <div className="absolute top-20 left-20 text-xl animate-float opacity-70" style={{ animationDelay: '1.2s' }}>⭐</div>
          
          {/* Main image */}
          <div className="w-48 h-48 mx-auto relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 blur-xl opacity-50"></div>
            <img
              src="/assets/empty_light.svg"
              alt="Join us"
              className="relative w-full h-full object-contain"
            />
          </div>

          <Heading level={3} className="text-2xl font-bold px-6">
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Let's Be Friends! 🌟
            </span>
          </Heading>
        </View>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            onClick={toSignIn}
            className="text-base font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Already Friends? Sign In Here! 😄
          </Button>
        </View>
      );
    },
  },

  ConfirmSignUp: {
    Header() {
      return (
        <View textAlign="center" className="space-y-4 relative">
          <div className="absolute top-4 right-12 text-xl animate-spin-slow">✨</div>
          <div className="absolute top-16 left-12 text-xl animate-bounce">⭐</div>
          <Heading 
            level={3} 
            className="text-2xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent"
          >
            Almost There! Just One More Step! 🎉
          </Heading>
        </View>
      );
    },
  },

  ConfirmSignIn: {
    Header() {
      return (
        <View textAlign="center" className="space-y-4 relative">
          <div className="absolute top-4 right-12 text-xl animate-spin-slow">✨</div>
          <div className="absolute top-16 left-12 text-xl animate-bounce">⭐</div>
          <Heading 
            level={3} 
            className="text-2xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent"
          >
            Let's Make Sure It's You! 🔐
          </Heading>
        </View>
      );
    },
  },

  SetupTotp: {
    Header() {
      return (
        <View textAlign="center" className="space-y-4 relative">
          <div className="absolute top-4 right-12 text-xl animate-spin-slow">✨</div>
          <div className="absolute top-16 left-12 text-xl animate-bounce">⭐</div>
          <Heading 
            level={3} 
            className="text-2xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent"
          >
            Extra Security Setup! 🛡️
          </Heading>
        </View>
      );
    },
  },

  ForgotPassword: {
    Header() {
      return (
        <View textAlign="center" className="space-y-4 relative">
          <div className="absolute top-4 right-12 text-xl animate-spin-slow">✨</div>
          <div className="absolute top-16 left-12 text-xl animate-bounce">⭐</div>
          <Heading 
            level={3} 
            className="text-2xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent"
          >
            Let's Get Your Password Back! 🔑
          </Heading>
        </View>
      );
    },
  },

  ConfirmResetPassword: {
    Header() {
      return (
        <View textAlign="center" className="space-y-4 relative">
          <div className="absolute top-4 right-12 text-xl animate-spin-slow">✨</div>
          <div className="absolute top-16 left-12 text-xl animate-bounce">⭐</div>
          <Heading 
            level={3} 
            className="text-2xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent"
          >
            Create Your New Password! 🔐
          </Heading>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: 'Type your special IC Number here',
      label: 'Your Special IC Number:',
      isRequired: true,
    },
    password: {
      label: 'Password:',
      placeholder: 'Enter your magical password',
      isRequired: true,
    },
  },
  signUp: {
    name: {
      placeholder: 'Enter your Full Name',
      label: 'Full Name:',
      isRequired: true,
      order: 1,
    },
    username: {
      placeholder: 'Enter your IC Number',
      label: 'IC Number:',
      isRequired: true,
      order: 2,
    },
    email: {
      placeholder: 'Enter your E-mail Address',
      label: 'E-mail:',
      isRequired: true,
      order: 3,
    },
    'custom:guardianName': {
      placeholder: 'Enter your Guardian Name',
      label: 'Guardian Name:',
      isRequired: true,
      order: 4,
    },
    phone_number: {
      placeholder: 'Enter your Phone Number',
      label: 'Phone Number:',
      isRequired: true,
      order: 5,
      dialCode: '+60',
    },
    address: {
      placeholder: 'Enter your Address',
      label: 'Address:',
      isRequired: true,
      order: 6,
    },
    password: {
      label: 'Password:',
      placeholder: 'Create your magical password',
      isRequired: true,
      order: 7,
    },
    confirm_password: {
      label: 'Confirm Password:',
      placeholder: 'Type your magical password again',
      isRequired: true,
      order: 8,
    },
  },
  confirmSignUp: {
    confirmation_code: {
      placeholder: 'Enter the magical code we sent you',
      label: 'Confirmation Code:',
      isRequired: true,
    },
  },
  forgotPassword: {
    username: {
      placeholder: 'Enter your email address',
      label: 'Email:',
      isRequired: true,
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: 'Enter the magical code we sent you',
      label: 'Confirmation Code:',
      isRequired: true,
    },
    password: {
      placeholder: 'Create your new magical password',
      label: 'New Password:',
      isRequired: true,
    },
    confirm_password: {
      placeholder: 'Type your new magical password again',
      label: 'Confirm Password:',
      isRequired: true,
    },
  },
};

const CustomAuthenticator: React.FC<CustomAuthenticatorProps> = ({ children }) => {
  const services = {
    async handleSignUp(input: SignUpInput) {
      const { username, password, options } = input;
      const customUsername = username.toLowerCase();
      const customEmail = options?.userAttributes?.email?.toLowerCase();
      
      const dynamoDB = new AWS.DynamoDB.DocumentClient({
        region: process.env.REACT_APP_AWS_DYNAMODB_REGION,
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
      });

      const params = {
        TableName: 'IC_Numbers',
        Key: {
          icNumber: customUsername
        }
      };

      try {
        const result = await dynamoDB.get(params).promise();
        
        if (!result.Item) {
          throw new Error('IC Number not found in the database. Sign up is not allowed.');
        }

        return signUp({
          username: customUsername,
          password,
          options: {
            ...input.options,
            userAttributes: {
              ...input.options?.userAttributes,
              email: customEmail,
            },
            autoSignIn: true 
          },
        });
      } catch (error) {
        console.error('Error checking IC Number:', error);
        throw error;
      }
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50" />

      {/* Main content */}
      <div className="relative w-full max-w-md">
        {/* Decorative border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 opacity-30 animate-gradient" />
        
        <Authenticator 
          formFields={formFields} 
          services={services} 
          components={components} 
          variation='modal'
          className={`
            relative z-10
            [&_.amplify-card]:bg-white
            [&_.amplify-card]:rounded-2xl
            [&_.amplify-card]:shadow-lg
            [&_.amplify-card]:border-none
            [&_.amplify-card]:px-6
            [&_.amplify-card]:py-8
            
            [&_.amplify-button.amplify-field-group__control]:bg-gradient-to-r
            [&_.amplify-button.amplify-field-group__control]:from-pink-500
            [&_.amplify-button.amplify-field-group__control]:to-orange-500
            [&_.amplify-button.amplify-field-group__control]:rounded-xl
            [&_.amplify-button.amplify-field-group__control]:text-white
            [&_.amplify-button.amplify-field-group__control]:h-12
            [&_.amplify-button.amplify-field-group__control]:font-medium
            [&_.amplify-button.amplify-field-group__control]:transition-all
            [&_.amplify-button.amplify-field-group__control]:hover:opacity-90
            
            [&_.amplify-input]:border
            [&_.amplify-input]:border-gray-200
            [&_.amplify-input]:rounded-xl
            [&_.amplify-input]:h-12
            [&_.amplify-input]:px-4
            [&_.amplify-input]:focus:border-purple-300
            [&_.amplify-input]:focus:ring-0
            
            [&_.amplify-label]:text-gray-700
            [&_.amplify-label]:font-medium
            [&_.amplify-label]:mb-1
            
            [&_.amplify-tabs]:border-b
            [&_.amplify-tabs]:border-gray-200
            [&_.amplify-tabs-item]:text-gray-600
            [&_.amplify-tabs-item[data-state=active]]:text-primary
            [&_.amplify-tabs-item[data-state=active]]:border-b-2
            [&_.amplify-tabs-item[data-state=active]]:border-primary
          `}
        >
          {children}
        </Authenticator>

        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => {
            const icons = ['✨', '⭐', '🌟', '🎈', '🎨', '📚', '🌈', '🎭'];
            return (
              <div
                key={i}
                className="absolute text-2xl animate-float"
                style={{
                  left: `${Math.random() * 90 + 5}%`,
                  top: `${Math.random() * 90 + 5}%`,
                  animationDelay: `${i * 0.7}s`,
                  opacity: 0.3,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                {icons[i]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomAuthenticator;