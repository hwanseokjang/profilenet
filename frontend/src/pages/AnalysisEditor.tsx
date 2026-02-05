import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Refresh as ResetIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import WorkflowNode from '../components/WorkflowBuilder/WorkflowNode';
import {
  SubjectSettings,
  RelationSettings,
  ExpressionSettings,
} from '../components/WorkflowBuilder/SettingsPanel';
import { useAnalysisStore } from '../store/analysisStore';
import type { Subject, Relation, AnalysisExpression } from '../types/analysis';

type SelectedNode =
  | { type: 'subject'; subjectId: string }
  | { type: 'relation'; subjectId: string; relationId: string }
  | { type: 'subjectExpression'; subjectId: string; expressionId: string }
  | { type: 'relationExpression'; subjectId: string; relationId: string; expressionId: string }
  | null;

export default function AnalysisEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getProject,
    updateProject,
    addSubject,
    updateSubject,
    deleteSubject,
    addRelation,
    updateRelation,
    deleteRelation,
    addSubjectAnalysis,
    updateSubjectAnalysis,
    deleteSubjectAnalysis,
    addRelationAnalysis,
    updateRelationAnalysis,
    deleteRelationAnalysis,
    addKeyword,
    updateKeyword,
    deleteKeyword,
  } = useAnalysisStore();

  const [selectedNode, setSelectedNode] = useState<SelectedNode>(null);

  const project = getProject(id || '');

  useEffect(() => {
    if (!project) {
      navigate('/');
    }
  }, [project, navigate]);

  if (!project) return null;

  const handleSave = () => {
    const errors: string[] = [];

    if (project.subjects.length === 0) {
      errors.push('\uC8FC\uC81C\uC5B4\uAC00 \uCD5C\uC18C 1\uAC1C \uD544\uC694\uD569\uB2C8\uB2E4');
    }

    for (const subject of project.subjects) {
      const sName = subject.group_name || '(\uBBF8\uC785\uB825)';

      if (!subject.group_name.trim()) {
        errors.push('\uC8FC\uC81C\uC5B4 \uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
      }
      if (subject.keywords.length === 0 || !subject.keywords.some(k => k.name.trim() && k.query.trim())) {
        errors.push('\uC8FC\uC81C\uC5B4 [' + sName + ']: \uD0A4\uC6CC\uB4DC\uC640 \uCFFC\uB9AC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694');
      }
      if (!subject.filter_guide.trim()) {
        errors.push('\uC8FC\uC81C\uC5B4 [' + sName + ']: \uD544\uD130\uB9C1 \uC870\uAC74\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
      }

      for (const relation of subject.relations) {
        const rName = relation.group_name || '(\uBBF8\uC785\uB825)';

        if (!relation.group_name.trim()) {
          errors.push('\uC5F0\uAD00\uC5B4 \uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
        }
        if (!relation.edge_name.trim()) {
          errors.push('\uC5F0\uAD00\uC5B4 [' + rName + ']: \uAD00\uACC4\uBA85\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
        }
        if (relation.keywords.length === 0 || !relation.keywords.some(k => k.name.trim() && k.query.trim())) {
          errors.push('\uC5F0\uAD00\uC5B4 [' + rName + ']: \uD0A4\uC6CC\uB4DC\uC640 \uCFFC\uB9AC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694');
        }
        if (!relation.relation_guide.trim()) {
          errors.push('\uC5F0\uAD00\uC5B4 [' + rName + ']: \uD544\uD130\uB9C1 \uC870\uAC74\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
        }

        for (const analysis of relation.analyses) {
          const aName = analysis.group_name || '(\uBBF8\uC785\uB825)';

          if (!analysis.group_name.trim()) {
            errors.push('\uD45C\uD604 \uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
          }
          if (analysis.analysis_methods.length === 0) {
            errors.push('\uD45C\uD604 [' + aName + ']: \uD45C\uD604 \uC885\uB958\uB97C 1\uAC1C \uC774\uC0C1 \uC120\uD0DD\uD574\uC8FC\uC138\uC694');
          }
          if (!analysis.analysis_guide.trim()) {
            errors.push('\uD45C\uD604 [' + aName + ']: \uC0DD\uC131 \uC870\uAC74\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
          }
        }
      }

      for (const analysis of subject.analyses) {
        const aName = analysis.group_name || '(\uBBF8\uC785\uB825)';

        if (!analysis.group_name.trim()) {
          errors.push('\uD45C\uD604 \uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
        }
        if (analysis.analysis_methods.length === 0) {
          errors.push('\uD45C\uD604 [' + aName + ']: \uD45C\uD604 \uC885\uB958\uB97C 1\uAC1C \uC774\uC0C1 \uC120\uD0DD\uD574\uC8FC\uC138\uC694');
        }
        if (!analysis.analysis_guide.trim()) {
          errors.push('\uD45C\uD604 [' + aName + ']: \uC0DD\uC131 \uC870\uAC74\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
        }
      }
    }

    if (errors.length > 0) {
      const msg = errors.slice(0, 5).join('\n');
      const extra = errors.length > 5 ? '\n... \uC678 ' + (errors.length - 5) + '\uAC74' : '';
      alert('\uD544\uC218 \uD56D\uBAA9\uC744 \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694:\n\n' + msg + extra);
      updateProject(project.id, { status: 'unavailable' });
      return;
    }

    updateProject(project.id, { status: 'available' });
    alert('\uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBD84\uC11D \uC2E4\uD589\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4.');
  };

  const handleReset = () => {
    if (confirm('\uBAA8\uB4E0 \uC124\uC815\uC744 \uCD08\uAE30\uD654\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) {
      updateProject(project.id, { subjects: [] });
      setSelectedNode(null);
    }
  };

  const getSelectedData = () => {
    if (!selectedNode) return null;

    if (selectedNode.type === 'subject') {
      return project.subjects.find((s) => s.id === selectedNode.subjectId);
    }
    if (selectedNode.type === 'relation') {
      const subject = project.subjects.find((s) => s.id === selectedNode.subjectId);
      return subject?.relations.find((r) => r.id === selectedNode.relationId);
    }
    if (selectedNode.type === 'subjectExpression') {
      const subject = project.subjects.find((s) => s.id === selectedNode.subjectId);
      return subject?.analyses.find((a) => a.id === selectedNode.expressionId);
    }
    if (selectedNode.type === 'relationExpression') {
      const subject = project.subjects.find((s) => s.id === selectedNode.subjectId);
      const relation = subject?.relations.find((r) => r.id === selectedNode.relationId);
      return relation?.analyses.find((a) => a.id === selectedNode.expressionId);
    }
    return null;
  };

  const renderSettingsPanel = () => {
    if (!selectedNode) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6b7280',
          }}
        >
          <Typography sx={{ fontSize: '32px', mb: 1 }}>{'\uD83D\uDCDD'}</Typography>
          <Typography>{'\uB178\uB4DC\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694'}</Typography>
        </Box>
      );
    }

    const data = getSelectedData();
    if (!data) return null;

    if (selectedNode.type === 'subject') {
      const subject = data as Subject;
      return (
        <SubjectSettings
          subject={subject}
          onUpdate={(updates) => updateSubject(project.id, subject.id, updates)}
          onAddKeyword={() => addKeyword(project.id, subject.id)}
          onUpdateKeyword={(kwId, updates) => updateKeyword(project.id, subject.id, kwId, updates)}
          onDeleteKeyword={(kwId) => deleteKeyword(project.id, subject.id, kwId)}
        />
      );
    }

    if (selectedNode.type === 'relation') {
      const relation = data as Relation;
      return (
        <RelationSettings
          relation={relation}
          onUpdate={(updates) => updateRelation(project.id, selectedNode.subjectId, relation.id, updates)}
          onAddKeyword={() => addKeyword(project.id, selectedNode.subjectId, relation.id)}
          onUpdateKeyword={(kwId, updates) =>
            updateKeyword(project.id, selectedNode.subjectId, kwId, updates, relation.id)
          }
          onDeleteKeyword={(kwId) => deleteKeyword(project.id, selectedNode.subjectId, kwId, relation.id)}
        />
      );
    }

    if (selectedNode.type === 'subjectExpression' || selectedNode.type === 'relationExpression') {
      const expression = data as AnalysisExpression;
      return (
        <ExpressionSettings
          expression={expression}
          onUpdate={(updates) => {
            if (selectedNode.type === 'subjectExpression') {
              updateSubjectAnalysis(project.id, selectedNode.subjectId, expression.id, updates);
            } else {
              updateRelationAnalysis(
                project.id,
                selectedNode.subjectId,
                selectedNode.relationId,
                expression.id,
                updates
              );
            }
          }}
        />
      );
    }

    return null;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #374151',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: '#9ca3af' }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ color: '#f9fafb', fontWeight: 700 }}>
            {project.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            {'\uBD84\uC11D \uACBD\uB85C: '}{project.subjects.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {project.subjects.length === 0 && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addSubject(project.id)}
              sx={{
                color: '#14b8a6',
                borderColor: '#14b8a6',
                '&:hover': { borderColor: '#0d9488', bgcolor: 'rgba(20, 184, 166, 0.1)' },
              }}
            >
              {'\uC8FC\uC81C\uC5B4 \uCD94\uAC00'}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            sx={{
              color: '#9ca3af',
              borderColor: '#374151',
              '&:hover': { borderColor: '#6b7280' },
            }}
          >
            {'\uCD08\uAE30\uD654'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              bgcolor: '#0f766e',
              '&:hover': { bgcolor: '#0d9488' },
            }}
          >
            {'\uC800\uC7A5'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, gap: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: '#111827',
            borderRadius: 2,
            p: 3,
          }}
        >
          {project.subjects.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#6b7280',
              }}
            >
              <Typography sx={{ fontSize: '48px', mb: 2 }}>{'\uD83C\uDFAF'}</Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {'\uC8FC\uC81C\uC5B4\uB97C \uBA3C\uC800 \uCD94\uAC00\uD574\uC8FC\uC138\uC694'}
              </Typography>
              <Typography variant="body2">{'\uC0C1\uB2E8\uC758 "\uC8FC\uC81C\uC5B4 \uCD94\uAC00" \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC138\uC694'}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {project.subjects.map((subject) => (
                <Box key={subject.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography sx={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, width: 80 }}>
                      {'\uC8FC\uC81C\uC5B4'}
                    </Typography>
                    <WorkflowNode
                      type="subject"
                      title={subject.group_name}
                      description={subject.filter_guide}
                      isSelected={selectedNode?.type === 'subject' && selectedNode.subjectId === subject.id}
                      onClick={() => setSelectedNode({ type: 'subject', subjectId: subject.id })}
                      onDelete={() => {
                        deleteSubject(project.id, subject.id);
                        setSelectedNode(null);
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, ml: 4 }}>
                    {subject.analyses.map((analysis, idx) => (
                      <Paper
                        key={analysis.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          bgcolor: 'rgba(31, 41, 55, 0.3)',
                          border: '1px solid #374151',
                          borderRadius: 2,
                          position: 'relative',
                        }}
                      >
                        <Typography
                          sx={{
                            position: 'absolute',
                            top: -12,
                            left: 12,
                            bgcolor: '#111827',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 3,
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#6b7280',
                          }}
                        >
                          {'\uD45C\uD604 \uACBD\uB85C '}{idx + 1}
                        </Typography>
                        <WorkflowNode
                          type="subject"
                          title={subject.group_name}
                          isReference
                        />
                        <ArrowIcon sx={{ color: '#0f766e', opacity: 0.5 }} />
                        <WorkflowNode
                          type="expression"
                          title={analysis.group_name}
                          description={analysis.analysis_guide}
                          isSelected={
                            selectedNode?.type === 'subjectExpression' &&
                            selectedNode.subjectId === subject.id &&
                            selectedNode.expressionId === analysis.id
                          }
                          onClick={() =>
                            setSelectedNode({
                              type: 'subjectExpression',
                              subjectId: subject.id,
                              expressionId: analysis.id,
                            })
                          }
                          onDelete={() => {
                            deleteSubjectAnalysis(project.id, subject.id, analysis.id);
                            setSelectedNode(null);
                          }}
                        />
                      </Paper>
                    ))}

                    {subject.relations.map((relation, relIdx) => (
                      <Paper
                        key={relation.id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          p: 2,
                          bgcolor: 'rgba(31, 41, 55, 0.3)',
                          border: '1px solid #374151',
                          borderRadius: 2,
                          position: 'relative',
                        }}
                      >
                        <Typography
                          sx={{
                            position: 'absolute',
                            top: -12,
                            left: 12,
                            bgcolor: '#111827',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 3,
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#6b7280',
                          }}
                        >
                          {'\uBD84\uC11D \uACBD\uB85C '}{relIdx + 1}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <WorkflowNode type="subject" title={subject.group_name} isReference />
                          <ArrowIcon sx={{ color: '#0f766e', opacity: 0.5 }} />
                          <WorkflowNode
                            type="relation"
                            title={relation.group_name}
                            description={relation.edge_name}
                            isSelected={
                              selectedNode?.type === 'relation' &&
                              selectedNode.subjectId === subject.id &&
                              selectedNode.relationId === relation.id
                            }
                            onClick={() =>
                              setSelectedNode({
                                type: 'relation',
                                subjectId: subject.id,
                                relationId: relation.id,
                              })
                            }
                            onDelete={() => {
                              deleteRelation(project.id, subject.id, relation.id);
                              setSelectedNode(null);
                            }}
                          />
                          <ArrowIcon sx={{ color: '#0f766e', opacity: 0.3 }} />
                          {relation.analyses.length > 0 ? (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              {relation.analyses.map((analysis) => (
                                <WorkflowNode
                                  key={analysis.id}
                                  type="expression"
                                  title={analysis.group_name}
                                  description={analysis.analysis_guide}
                                  isSelected={
                                    selectedNode?.type === 'relationExpression' &&
                                    selectedNode.subjectId === subject.id &&
                                    selectedNode.relationId === relation.id &&
                                    selectedNode.expressionId === analysis.id
                                  }
                                  onClick={() =>
                                    setSelectedNode({
                                      type: 'relationExpression',
                                      subjectId: subject.id,
                                      relationId: relation.id,
                                      expressionId: analysis.id,
                                    })
                                  }
                                  onDelete={() => {
                                    deleteRelationAnalysis(project.id, subject.id, relation.id, analysis.id);
                                    setSelectedNode(null);
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                minWidth: 200,
                                p: 2,
                                border: '2px dashed #374151',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                alignItems: 'center',
                              }}
                            >
                              <Button
                                size="small"
                                onClick={() => addRelationAnalysis(project.id, subject.id, relation.id)}
                                sx={{
                                  color: '#9ca3af',
                                  border: '1px solid #374151',
                                  '&:hover': { borderColor: '#14b8a6', color: '#14b8a6' },
                                }}
                              >
                                {'\uD45C\uD604 \uCD94\uAC00'}
                              </Button>
                            </Box>
                          )}
                          {relation.analyses.length > 0 && (
                            <Button
                              size="small"
                              onClick={() => addRelationAnalysis(project.id, subject.id, relation.id)}
                              sx={{
                                minWidth: 'auto',
                                color: '#9ca3af',
                                '&:hover': { color: '#14b8a6' },
                              }}
                            >
                              +
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    ))}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => addRelation(project.id, subject.id)}
                        sx={{
                          color: '#14b8a6',
                          borderColor: '#374151',
                          borderStyle: 'dashed',
                          '&:hover': { borderColor: '#14b8a6' },
                        }}
                      >
                        {'\uBD84\uC11D \uACBD\uB85C \uCD94\uAC00 (\uC5F0\uAD00\uC5B4)'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => addSubjectAnalysis(project.id, subject.id)}
                        sx={{
                          color: '#f59e0b',
                          borderColor: '#374151',
                          borderStyle: 'dashed',
                          '&:hover': { borderColor: '#f59e0b' },
                        }}
                      >
                        {'\uC9C1\uC811 \uD45C\uD604 \uCD94\uAC00'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            width: 420,
            bgcolor: '#111827',
            borderRadius: 2,
            p: 3,
            overflow: 'auto',
          }}
        >
          {renderSettingsPanel()}
        </Box>
      </Box>
    </Box>
  );
}
