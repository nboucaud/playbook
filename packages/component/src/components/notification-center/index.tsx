import { CloseIcon, InformationFillIcon } from '@blocksuite/icons';
import * as Toast from '@radix-ui/react-toast';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IconButton } from '../..';
import {
  closeButtonStyle,
  messageStyle,
  notificationCenterViewportStyle,
  notificationContentStyle,
  notificationIconStyle,
  notificationStyle,
  notificationTitleContactStyle,
  notificationTitleStyle,
  progressBarStyle,
  undoButtonStyle,
} from './index.css';
import type { Notification } from './index.jotai';
import {
  expandNotificationCenterAtom,
  notificationsAtom,
  removeNotificationAtom,
} from './index.jotai';

export { notificationsAtom };

export type NotificationCardProps = {
  notification: Notification;
  index: number;
};

function NotificationCard(props: NotificationCardProps): ReactElement {
  const animateRef = useRef<SVGAnimateElement>(null);
  const [expand, setExpand] = useAtom(expandNotificationCenterAtom);
  const removeNotification = useSetAtom(removeNotificationAtom);
  const { notification, index } = props;
  const [hidden, setHidden] = useState<boolean>(() => !expand && index >= 3);
  useEffect(() => {
    if (animateRef.current) {
      const animate = animateRef.current;
      const callback = () => {
        setHidden(true);
      };
      animate.addEventListener('endEvent', callback, { once: true });
      return () => {
        animate.removeEventListener('endEvent', callback);
      };
    }
  }, []);
  return (
    <Toast.Root
      onClick={() => {
        setExpand(!expand);
      }}
      className={notificationStyle}
      style={{
        transition: 'transform 0.3s, opacity 0.3s, margin-bottom 0.3s',
        marginBottom: !expand ? '0' : '1rem',
        transform: expand
          ? 'translateY(0) scale(1)'
          : `translateY(${index * 75}px) scale(${1 - index * 0.02})`,
        opacity: expand ? '1' : hidden ? '0' : 1 - index * 0.1,
      }}
      open={true}
    >
      <div className={notificationContentStyle}>
        <Toast.Title className={notificationTitleStyle}>
          <div className={notificationIconStyle}>
            <InformationFillIcon />
          </div>
          <div className={notificationTitleContactStyle}>
            {notification.title}
          </div>
          <div className={undoButtonStyle}>UNDO</div>
          <IconButton className={closeButtonStyle}>
            <CloseIcon
              onClick={useCallback(() => {
                removeNotification(notification.key);
              }, [notification.key, removeNotification])}
            />
          </IconButton>
        </Toast.Title>
        <Toast.Description className={messageStyle}>
          {notification.message}
        </Toast.Description>
        <div className={progressBarStyle}>
          <svg width="100%" height="4">
            <rect
              width="100%"
              height="4"
              fill="var(--affine-hover-color)"
              rx="2"
              ry="2"
            />
            <rect
              width="0%"
              height="4"
              fill="var(--affine-primary-color)"
              rx="2"
              ry="2"
            >
              <animate
                ref={animateRef}
                attributeName="width"
                from="0%"
                to="100%"
                dur={`${(notification.timeout - 100) / 1000}s`}
                fill="freeze"
              />
            </rect>
          </svg>
        </div>
      </div>
    </Toast.Root>
  );
}

export function NotificationCenter(): ReactElement {
  const notifications = useAtomValue(notificationsAtom);
  const [expand, setExpand] = useAtom(expandNotificationCenterAtom);

  if (notifications.length === 0 && expand) {
    setExpand(false);
  }
  return (
    <Toast.Provider swipeDirection="right">
      {notifications.map((notification, index) => (
        <NotificationCard
          notification={notification}
          index={index}
          key={notification.key}
        />
      ))}
      <Toast.Viewport className={notificationCenterViewportStyle} />
    </Toast.Provider>
  );
}
