import { Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

type NodeType = 'subject' | 'relation' | 'expression';

interface WorkflowNodeProps {
  type: NodeType;
  title: string;
  description?: string;
  isSelected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  isReference?: boolean;
}

const nodeColors: Record<NodeType, string> = {
  subject: '#8b5cf6',   // 보라색
  relation: '#14b8a6',  // 민트색
  expression: '#f59e0b', // 주황색
};

const nodeLabels: Record<NodeType, string> = {
  subject: '주제어',
  relation: '연관어',
  expression: '표현',
};

export default function WorkflowNode({
  type,
  title,
  description,
  isSelected,
  onClick,
  onDelete,
  isReference,
}: WorkflowNodeProps) {
  const color = nodeColors[type];

  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: '#1f2937',
        border: type === 'subject' ? `3px solid ${color}` : `1px solid #374151`,
        borderLeft: type !== 'subject' ? `4px solid ${color}` : undefined,
        borderRadius: 2,
        p: 2,
        minWidth: 200,
        maxWidth: 250,
        cursor: isReference ? 'default' : 'pointer',
        opacity: isReference ? 0.6 : 1,
        transition: 'all 0.2s',
        position: 'relative',
        ...(isSelected && !isReference && {
          borderColor: '#14b8a6',
          boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.2)',
        }),
        ...(!isReference && {
          '&:hover': {
            borderColor: '#14b8a6',
            transform: 'translateY(-1px)',
          },
        }),
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box
          sx={{
            bgcolor: `${color}33`,
            color: color,
            px: 1,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '9px',
            fontWeight: 600,
            textTransform: 'uppercase',
            mb: 0.75,
          }}
        >
          {nodeLabels[type]}
        </Box>
        {onDelete && !isReference && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              color: '#9ca3af',
              p: 0.25,
              '&:hover': {
                color: '#ef4444',
                bgcolor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
      <Typography
        sx={{
          color: '#f9fafb',
          fontSize: '14px',
          fontWeight: 600,
          mb: 0.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title || '(설정 필요)'}
      </Typography>
      {description && (
        <Typography
          sx={{
            color: '#9ca3af',
            fontSize: '11px',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}
