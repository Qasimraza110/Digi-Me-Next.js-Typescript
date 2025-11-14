// declare global {
//   interface Window {
//     google: {
//       accounts: {
//         id: {
//           initialize: (config: {
//             client_id: string;
//             callback: (response: { credential: string }) => void;
//           }) => void;
//           prompt: () => void;
//           renderButton: (element: HTMLElement, config: {
//             theme?: 'outline' | 'filled_blue' | 'filled_black';
//             size?: 'large' | 'medium' | 'small';
//             width?: number;
//             height?: number;
//             text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
//             shape?: 'rectangular' | 'pill' | 'circle' | 'square';
//           }) => void;
//         };
//       };
//     };
//   }
// }

// export {};

export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              width?: number;
              height?: number;
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            }
          ) => void;
        };
      };
    };
  }
}

