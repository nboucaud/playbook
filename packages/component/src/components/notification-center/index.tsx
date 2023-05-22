import { CloseIcon, InformationFillIcon } from '@blocksuite/icons';
import * as Toast from '@radix-ui/react-toast';
import clsx from 'clsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { MouseEvent, ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IconButton } from '../..';
import {
  closeButtonStyle,
  closeButtonWithoutUndoStyle,
  darkErrorStyle,
  darkIconStyle,
  darkInfoStyle,
  darkSuccessStyle,
  darkWarningStyle,
  lightErrorStyle,
  lightInfoStyle,
  lightSuccessStyle,
  lightWarningStyle,
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
const typeColorMap = {
  info: {
    light: lightInfoStyle,
    dark: darkInfoStyle,
  },
  success: {
    light: lightSuccessStyle,
    dark: darkSuccessStyle,
  },
  warning: {
    light: lightWarningStyle,
    dark: darkWarningStyle,
  },
  error: {
    light: lightErrorStyle,
    dark: darkErrorStyle,
  },
};
function NotificationCard(props: NotificationCardProps): ReactElement {
  const animateRef = useRef<SVGAnimateElement>(null);
  const [expand, setExpand] = useAtom(expandNotificationCenterAtom);
  const removeNotification = useSetAtom(removeNotificationAtom);
  const { notification, index } = props;
  const [hidden, setHidden] = useState<boolean>(() => !expand && index >= 3);
  const typeStyle =
    typeColorMap[notification.type][notification.theme || 'light'];
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

  const onClickRemove = useCallback(() => {
    removeNotification(notification.key);
  }, [notification.key, removeNotification]);

  const onClickUndo = useCallback(() => {
    if (notification.undo) {
      return notification.undo();
    }
  }, [notification]);

  const onClickExpand = useCallback(
    (e: MouseEvent) => {
      if (e.target instanceof SVGElement) {
        return;
      }
      setExpand(expand => !expand);
    },
    [setExpand]
  );

  return (
    <Toast.Root
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
      onClick={onClickExpand}
    >
      <div
        className={clsx(notificationContentStyle, {
          [typeStyle]: notification.theme,
        })}
      >
        <Toast.Title
          className={clsx(notificationTitleStyle, {
            [darkIconStyle]: notification.theme === 'dark',
          })}
        >
          <div
            className={clsx(notificationIconStyle, {
              [darkIconStyle]: notification.theme === 'dark',
            })}
          >
            <InformationFillIcon />
          </div>
          <div className={notificationTitleContactStyle}>
            {notification.title}
          </div>
          {notification.undo && (
            <div
              className={clsx(undoButtonStyle, {
                [darkIconStyle]: notification.theme === 'dark',
              })}
              onClick={onClickUndo}
            >
              UNDO
            </div>
          )}
          <IconButton
            className={clsx(closeButtonStyle, {
              [closeButtonWithoutUndoStyle]: !notification.undo,
              [darkIconStyle]: notification.theme === 'dark',
            })}
          >
            <CloseIcon onClick={onClickRemove} />
          </IconButton>
        </Toast.Title>
        <Toast.Description
          className={clsx(messageStyle, {
            [darkIconStyle]: notification.theme === 'dark',
          })}
        >
          {notification.message}
        </Toast.Description>
        {notification.timeout && (
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
        )}
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
