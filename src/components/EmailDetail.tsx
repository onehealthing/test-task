import React from 'react';
import {
  Typography,
  Avatar,
  Divider,
  Paper,
  Box,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  StarBorder,
  Star,
} from '@mui/icons-material';
import { Email } from '@/lib/schema';

interface EmailDetailProps {
  email: Email | null;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email }) => {
  const getInitials = (name: string) => {
    return name.split('@')[0].substring(0, 2).toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!email) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'text.secondary',
          p: 4,
        }}
      >
        <Box>
          <EmailIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }}/>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            Select an email to view
          </Typography>
          <Typography variant="body2">
            Choose an email from the list to see its content here
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            {email.subject}
          </Typography>
          <Box>
            {email.isImportant ? (
              <Star htmlColor="#faaf00"/>
            ) : (
              <StarBorder color="action"/>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                backgroundColor: 'primary.main',
                width: 48,
                height: 48,
                fontSize: '1rem',
              }}
            >
              {getInitials(email.from)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {email.from}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                to {email.to}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <ScheduleIcon fontSize="small"/>
            <Typography variant="caption" sx={{ fontSize: '0.85rem' }}>
              {formatDate(email.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }}/>

      <Paper elevation={0} sx={{ backgroundColor: 'transparent' }}>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8,
            color: 'text.primary',
            fontFamily: 'inherit',
          }}
        >
          {email.content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default EmailDetail;
