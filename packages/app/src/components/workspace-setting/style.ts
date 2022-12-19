import { styled } from '@/styles';
import { Button } from '@/ui/button';
import MuiAvatar from '@mui/material/Avatar';

export const StyledSettingContainer = styled('div')(({ theme }) => {
  return {
    position: 'relative',
    display: 'flex',
    padding: '0px',
    width: '961px',
    background: theme.colors.popoverBackground,
    borderRadius: '12px',
    overflow: 'hidden',
  };
});

export const StyledSettingSidebar = styled('div')(({ theme }) => {
  {
    return {
      width: '236px',
      height: '620px',
      background: theme.mode === 'dark' ? '#272727' : '#FBFBFC',
    };
  }
});

export const StyledSettingContent = styled('div')(({ theme }) => {
  return {
    paddingLeft: '48px',
  };
});

export const StyledSetting = styled('div')(({ theme }) => {
  {
    return {
      width: '236px',
      height: '620px',
      background: theme.mode === 'dark' ? '#272727' : '#FBFBFC',
    };
  }
});

export const StyledSettingSidebarHeader = styled('div')(({ theme }) => {
  {
    return {
      fontWeight: '500',
      fontSize: '18px',
      lineHeight: '26px',
      textAlign: 'center',
      marginTop: '37px',
    };
  }
});

export const StyledSettingTabContainer = styled('ul')(({ theme }) => {
  {
    return {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '25px',
    };
  }
});

export const WorkspaceSettingTagItem = styled('li')<{ isActive?: boolean }>(
  ({ theme, isActive }) => {
    {
      return {
        display: 'flex',
        marginBottom: '12px',
        padding: '0 24px',
        height: '32px',
        color: isActive ? theme.colors.primaryColor : theme.colors.textColor,
        fontWeight: '400',
        fontSize: '16px',
        lineHeight: '32px',
        cursor: 'pointer',
      };
    }
  }
);

export const StyledSettingTagIconContainer = styled('div')(({ theme }) => {
  return {
    display: 'flex',
    alignItems: 'center',
    marginRight: '14.64px',
    width: '14.47px',
    fontSize: '14.47px',
  };
});

export const StyledSettingH2 = styled('h2')<{ marginTop?: number }>(
  ({ marginTop, theme }) => {
    return {
      fontWeight: '500',
      fontSize: '18px',
      lineHeight: '26px',
      marginTop: marginTop ? `${marginTop}px` : '0px',
    };
  }
);

export const StyledSettingAvatarContent = styled('div')(({ theme }) => {
  return {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '72px',
  };
});

export const StyledSettingAvatar = styled(MuiAvatar)(({ theme }) => {
  return { height: '72px', width: '72px' };
});

export const StyledAvatarUploadBtn = styled(Button)(({ theme }) => {
  return {
    backgroundColor: theme.colors.hoverBackground,
    color: theme.colors.primaryColor,
    margin: '0 12px 0 24px',
  };
});

export const StyledSettingInputContainer = styled('div')(({ theme }) => {
  return {
    marginTop: '12px',
  };
});

export const StyledDeleteButtonContainer = styled('div')(({ theme }) => {
  return {
    marginTop: '158px',
  };
});
