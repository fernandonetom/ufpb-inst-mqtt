import { store as Notify } from 'react-notifications-component';

export default function addNotify(props) {
  Notify.addNotification({
    title: 'Wonderful!',
    type: 'success',
    message: 'ok',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animate__animated', 'animate__fadeInUp'],
    animationOut: ['animate__animated', 'animate__fadeOutUp'],
    dismiss: {
      duration: 3000,
      onScreen: true,
    },
    slidingExit: {
      delay: 3000,
    },
    ...props,
  });
}
