import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Subject, Relation, AnalysisExpression, Keyword } from '../../types/analysis';

interface SubjectSettingsProps {
  subject: Subject;
  onUpdate: (updates: Partial<Subject>) => void;
  onAddKeyword: () => void;
  onUpdateKeyword: (keywordId: string, updates: Partial<Keyword>) => void;
  onDeleteKeyword: (keywordId: string) => void;
}

interface RelationSettingsProps {
  relation: Relation;
  onUpdate: (updates: Partial<Relation>) => void;
  onAddKeyword: () => void;
  onUpdateKeyword: (keywordId: string, updates: Partial<Keyword>) => void;
  onDeleteKeyword: (keywordId: string) => void;
}

interface ExpressionSettingsProps {
  expression: AnalysisExpression;
  onUpdate: (updates: Partial<AnalysisExpression>) => void;
}

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#f9fafb',
    fontSize: '13px',
    '& fieldset': { borderColor: '#374151' },
    '&:hover fieldset': { borderColor: '#14b8a6' },
    '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
  },
  '& .MuiInputLabel-root': {
    color: '#9ca3af',
    fontSize: '12px',
    '&.Mui-focused': { color: '#14b8a6' },
  },
};

const tableCellSx = {
  border: '1px solid #374151',
  p: 0.75,
  '& input': {
    width: '100%',
    bgcolor: '#0a0f14',
    border: '1px solid #374151',
    borderRadius: 1,
    color: '#f9fafb',
    fontSize: '11px',
    fontFamily: 'JetBrains Mono, monospace',
    p: 0.5,
    '&:focus': {
      outline: 'none',
      borderColor: '#14b8a6',
    },
  },
};

export function SubjectSettings({
  subject,
  onUpdate,
  onAddKeyword,
  onUpdateKeyword,
  onDeleteKeyword,
}: SubjectSettingsProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, fontSize: '16px' }}>
        주제어 설정
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          이름
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="예: 국내 맥주"
          value={subject.group_name}
          onChange={(e) => onUpdate({ group_name: e.target.value })}
          sx={textFieldSx}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          키워드 목록
        </Typography>
        <Table size="small" sx={{ bgcolor: '#1f2937', borderRadius: 1, mb: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...tableCellSx, bgcolor: '#1f2937', color: '#6b7280', fontSize: '10px', fontWeight: 600 }}>
                키워드
              </TableCell>
              <TableCell sx={{ ...tableCellSx, bgcolor: '#1f2937', color: '#6b7280', fontSize: '10px', fontWeight: 600 }}>
                쿼리
              </TableCell>
              <TableCell sx={{ ...tableCellSx, bgcolor: '#1f2937', color: '#6b7280', fontSize: '10px', fontWeight: 600 }}>
                설명
              </TableCell>
              <TableCell sx={{ ...tableCellSx, bgcolor: '#1f2937', width: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {subject.keywords.map((kw) => (
              <TableRow key={kw.id}>
                <TableCell sx={tableCellSx}>
                  <input
                    value={kw.name}
                    onChange={(e) => onUpdateKeyword(kw.id, { name: e.target.value })}
                    placeholder="카스"
                  />
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <input
                    value={kw.query}
                    onChange={(e) => onUpdateKeyword(kw.id, { query: e.target.value })}
                    placeholder="카스||cass"
                  />
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <input
                    value={kw.info}
                    onChange={(e) => onUpdateKeyword(kw.id, { info: e.target.value })}
                    placeholder="설명"
                  />
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteKeyword(kw.id)}
                    sx={{ color: '#9ca3af', p: 0.25, '&:hover': { color: '#ef4444' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddKeyword}
          sx={{
            color: '#9ca3af',
            border: '1px dashed #374151',
            '&:hover': { borderColor: '#14b8a6', color: '#14b8a6' },
          }}
        >
          행 추가
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          필터링 조건
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          placeholder="예: {@current}를 먹거나 마신다고 언급되었는지 여부"
          value={subject.filter_guide}
          onChange={(e) => onUpdate({ filter_guide: e.target.value })}
          sx={{
            ...textFieldSx,
            '& .MuiOutlinedInput-root': {
              ...textFieldSx['& .MuiOutlinedInput-root'],
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
            },
          }}
        />
      </Box>
    </Box>
  );
}

export function RelationSettings({
  relation,
  onUpdate,
  onAddKeyword,
  onUpdateKeyword,
  onDeleteKeyword,
}: RelationSettingsProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, fontSize: '16px' }}>
        연관어 설정
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          이름
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="예: 음식"
          value={relation.group_name}
          onChange={(e) => onUpdate({ group_name: e.target.value })}
          sx={textFieldSx}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          관계명
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="예: 같이 먹는 음식"
          value={relation.edge_name}
          onChange={(e) => onUpdate({ edge_name: e.target.value })}
          sx={textFieldSx}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          키워드 목록
        </Typography>
        <Table size="small" sx={{ bgcolor: '#1f2937', borderRadius: 1, mb: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...tableCellSx, bgcolor: '#1f2937', color: '#6b7280', fontSize: '10px', fontWeight: 600 }}>
                키워드
              </TableCell>
              <TableCell sx={{ ...tableCellSx, bgcolor: '#1f2937', color: '#6b7280', fontSize: '10px', fontWeight: 600 }}>
                쿼리
              </TableCell>
              <TableCell sx={{ ...tableCellSx, bgcolor: '#1f2937', color: '#6b7280', fontSize: '10px', fontWeight: 600 }}>
                설명
              </TableCell>
              <TableCell sx={{ ...tableCellSx, bgcolor: '#1f2937', width: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {relation.keywords.map((kw) => (
              <TableRow key={kw.id}>
                <TableCell sx={tableCellSx}>
                  <input
                    value={kw.name}
                    onChange={(e) => onUpdateKeyword(kw.id, { name: e.target.value })}
                    placeholder="감자튀김"
                  />
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <input
                    value={kw.query}
                    onChange={(e) => onUpdateKeyword(kw.id, { query: e.target.value })}
                    placeholder="감자튀김||감튀"
                  />
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <input
                    value={kw.info}
                    onChange={(e) => onUpdateKeyword(kw.id, { info: e.target.value })}
                    placeholder="설명"
                  />
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteKeyword(kw.id)}
                    sx={{ color: '#9ca3af', p: 0.25, '&:hover': { color: '#ef4444' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddKeyword}
          sx={{
            color: '#9ca3af',
            border: '1px dashed #374151',
            '&:hover': { borderColor: '#14b8a6', color: '#14b8a6' },
          }}
        >
          행 추가
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          필터링 조건
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          placeholder="예: {@subject}를 마실 때, {@current}를 같이 먹는지 여부"
          value={relation.relation_guide}
          onChange={(e) => onUpdate({ relation_guide: e.target.value })}
          sx={{
            ...textFieldSx,
            '& .MuiOutlinedInput-root': {
              ...textFieldSx['& .MuiOutlinedInput-root'],
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
            },
          }}
        />
      </Box>
    </Box>
  );
}

export function ExpressionSettings({ expression, onUpdate }: ExpressionSettingsProps) {
  const handleMethodChange = (method: string, checked: boolean) => {
    const methods = [...expression.analysis_methods];
    if (checked) {
      methods.push(method as typeof expression.analysis_methods[0]);
    } else {
      const index = methods.indexOf(method as typeof expression.analysis_methods[0]);
      if (index > -1) methods.splice(index, 1);
    }
    onUpdate({ analysis_methods: methods });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, fontSize: '16px' }}>
        표현 설정
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          이름
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="예: 맛 표현"
          value={expression.group_name}
          onChange={(e) => onUpdate({ group_name: e.target.value })}
          sx={textFieldSx}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl component="fieldset">
          <FormLabel sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
            생성 타입
          </FormLabel>
          <RadioGroup
            row
            value={expression.text_type}
            onChange={(e) => onUpdate({ text_type: e.target.value as 'narrative' | 'short' })}
          >
            <FormControlLabel
              value="narrative"
              control={<Radio size="small" sx={{ color: '#9ca3af', '&.Mui-checked': { color: '#14b8a6' } }} />}
              label="서술형"
              sx={{ '& .MuiFormControlLabel-label': { color: '#f9fafb', fontSize: '13px' } }}
            />
            <FormControlLabel
              value="short"
              control={<Radio size="small" sx={{ color: '#9ca3af', '&.Mui-checked': { color: '#14b8a6' } }} />}
              label="단답형"
              sx={{ '& .MuiFormControlLabel-label': { color: '#f9fafb', fontSize: '13px' } }}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          표현 종류
        </Typography>
        <FormGroup row>
          {[
            { value: 'positive', label: '긍정' },
            { value: 'negative', label: '부정' },
            { value: 'neutral', label: '중립' },
            { value: 'comprehensive', label: '종합' },
          ].map((item) => (
            <FormControlLabel
              key={item.value}
              control={
                <Checkbox
                  size="small"
                  checked={expression.analysis_methods.includes(item.value as typeof expression.analysis_methods[0])}
                  onChange={(e) => handleMethodChange(item.value, e.target.checked)}
                  sx={{ color: '#9ca3af', '&.Mui-checked': { color: '#14b8a6' } }}
                />
              }
              label={item.label}
              sx={{ '& .MuiFormControlLabel-label': { color: '#f9fafb', fontSize: '13px' } }}
            />
          ))}
        </FormGroup>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          분석 개수 (0 = 무제한)
        </Typography>
        <TextField
          type="number"
          size="small"
          value={expression.pool_size}
          onChange={(e) => onUpdate({ pool_size: parseInt(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
          sx={{ ...textFieldSx, width: 120 }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          생성 조건
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          size="small"
          placeholder="예: {@relation} 상황에서 {@subject}를 마실 때의 맛 표현을 추출합니다."
          value={expression.analysis_guide}
          onChange={(e) => onUpdate({ analysis_guide: e.target.value })}
          sx={{
            ...textFieldSx,
            '& .MuiOutlinedInput-root': {
              ...textFieldSx['& .MuiOutlinedInput-root'],
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
            },
          }}
        />
      </Box>
    </Box>
  );
}
