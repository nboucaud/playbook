import { styled } from '@/styles';
import { Modal, ModalWrapper, ModalCloseButton } from '@/ui/modal';
import { Button } from '@/ui/button';
import { useEffect, useState } from 'react';
import {
  getWorkspaces,
  Workspace,
  setActiveWorkspace,
  Login,
  User,
  getUserInfo,
  SignOut,
} from '@/hooks/mock-data/mock';
import { CreateWorkspaceModal } from '../create-workspace';
import {
  CloudUnsyncedIcon,
  CloudInsyncIcon,
  UsersIcon,
  AddIcon,
} from '@blocksuite/icons';
import { useConfirm } from '@/providers/confirm-provider';
import { toast } from '@/ui/toast';
interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const WorkspaceModal = ({ open, onClose }: LoginModalProps) => {
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const [user, setUser] = useState<User | null>();
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const { confirm } = useConfirm();
  useEffect(() => {
    setList();
    setUserInfo();
  }, []);

  const setList = () => {
    const data = getWorkspaces();
    console.log('data: ', data);
    setWorkspaceList(data);
  };
  const setUserInfo = () => {
    const data = getUserInfo();
    setUser(data);
  };
  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <ModalWrapper
          width={820}
          style={{ padding: '10px', display: 'flex', flexDirection: 'column' }}
        >
          <Header>
            <ContentTitle>My Workspaces</ContentTitle>
            <ModalCloseButton
              top={6}
              right={6}
              onClick={() => {
                onClose();
              }}
            />
          </Header>
          <Content>
            <WorkspaceList>
              {workspaceList.map((item, index) => {
                return (
                  <WorkspaceItem
                    onClick={() => {
                      setActiveWorkspace(item);
                      onClose();
                    }}
                    key={index}
                  >
                    <span style={{ width: '100px', marginRight: '20px' }}>
                      <svg
                        style={{
                          float: 'left',
                          marginTop: '6px',
                          marginLeft: '10px',
                          marginRight: '10px',
                        }}
                        width="24"
                        height="24"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="39"
                          height="39"
                          rx="19.5"
                          stroke="#6880FF"
                          fill="#FFF"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M18.6303 8.79688L11.2559 29.8393H15.5752L20.2661 15.2858L24.959 29.8393H29.2637L21.8881 8.79688H18.6303Z"
                          fill="#6880FF"
                        />
                      </svg>
                      {item.name}
                    </span>
                    <span style={{ position: 'relative', top: '6px' }}>
                      {item.type === 'local' && (
                        <CloudUnsyncedIcon fontSize={24} />
                      )}
                      {item.type === 'cloud' && (
                        <CloudInsyncIcon fontSize={24} />
                      )}
                      {item.isPublish && <UsersIcon fontSize={24} />}
                    </span>
                    {/* {item.isLocal ? 'isLocal' : ''}/ */}
                  </WorkspaceItem>
                );
              })}
              <li>
                <Button
                  type="primary"
                  onClick={() => {
                    setCreateWorkspaceOpen(true);
                  }}
                >
                  <AddIcon
                    style={{
                      fontSize: '20px',
                      top: '4px',
                      position: 'relative',
                      marginRight: '10px',
                    }}
                  />
                  Create Or Import
                </Button>
              </li>
            </WorkspaceList>
            <p style={{ fontSize: '14px', color: '#ccc', margin: '12px 0' }}>
              Tips:Workspace is your virtual space to capture, create and plan
              as just one person or together as a team.
            </p>
          </Content>
          <Footer>
            {!user ? (
              <Button
                onClick={() => {
                  Login();
                  toast('login success');
                  setUserInfo();
                }}
              >
                Sign in AFFiNE Cloud
              </Button>
            ) : (
              <Button
                onClick={() => {
                  SignOut();
                  setUserInfo();
                }}
              >
                Sign out of AFFiNE Cloud
              </Button>
            )}
          </Footer>
          <CreateWorkspaceModal
            open={createWorkspaceOpen}
            onClose={() => {
              setCreateWorkspaceOpen(false);
              setList();
              onClose();
              confirm({
                title: 'Enable AFFiNE Cloud?',
                content: `If enabled, the data in this workspace will be backed up and synchronized via AFFiNE Cloud.`,
                confirmText: user ? 'Enable' : 'Sign in and Enable',
                cancelText: 'Skip',
              }).then(confirm => {
                if (user) {
                  console.log('enable cloud');
                } else {
                  confirm && Login();
                }
              });
            }}
          ></CreateWorkspaceModal>
        </ModalWrapper>
      </Modal>
    </div>
  );
};

const Header = styled('div')({
  position: 'relative',
  height: '44px',
});

const Content = styled('div')({
  padding: '0 20px',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  flex: 1,
});

const ContentTitle = styled('span')({
  fontSize: '20px',
  lineHeight: '28px',
  fontWeight: 600,
  textAlign: 'left',
  paddingBottom: '16px',
});

const Footer = styled('div')({
  height: '70px',
  paddingLeft: '24px',
  marginTop: '32px',
  textAlign: 'center',
});

const WorkspaceList = styled('div')({
  display: 'grid',
  gridRowGap: '10px',
  gridColumnGap: '10px',
  fontSize: '16px',
  gridTemplateColumns: 'repeat(2, 1fr)',
});

const WorkspaceItem = styled('div')({
  cursor: 'pointer',
  padding: '8px',
  border: '1px solid #eee',
  fontWeight: 'bold',
  ':hover': {
    background: '#eee',
  },
});
