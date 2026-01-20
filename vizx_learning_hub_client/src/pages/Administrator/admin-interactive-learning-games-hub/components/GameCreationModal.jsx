import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Checkbox } from '../../../../components/ui/Checkbox';

const GameCreationModal = ({ isOpen, onClose, onCreateGame, userRole = 'admin' }) => {
  const [gameData, setGameData] = useState({ title: '', description: '', category: '', difficulty: 'beginner', type: 'quiz', timeLimit: 300, maxParticipants: 50, skills: [], questions: [], isPublic: true, allowRetries: true, showLeaderboard: true });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    { value: 'ai-fundamentals', label: 'AI Fundamentals' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'azure-ai', label: 'Azure AI Services' },
    { value: 'cognitive-services', label: 'Cognitive Services' },
    { value: 'bot-framework', label: 'Bot Framework' },
    { value: 'power-platform', label: 'Power Platform AI' }
  ];

  const difficultyOptions = [{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }];
  const typeOptions = [{ value: 'quiz', label: 'Quiz Game' }, { value: 'challenge', label: 'Challenge' }, { value: 'tournament', label: 'Tournament' }, { value: 'scenario', label: 'Scenario-based' }, { value: 'drag-drop', label: 'Interactive Drag & Drop' }];
  const skillOptions = [{ value: 'python', label: 'Python' }, { value: 'azure', label: 'Microsoft Azure' }, { value: 'machine-learning', label: 'Machine Learning' }, { value: 'data-analysis', label: 'Data Analysis' }, { value: 'ai-ethics', label: 'AI Ethics' }, { value: 'neural-networks', label: 'Neural Networks' }, { value: 'nlp', label: 'Natural Language Processing' }, { value: 'computer-vision', label: 'Computer Vision' }];

  const handleInputChange = (field, value) => setGameData({ ...gameData, [field]: value });
  const handleSkillToggle = (skill) => setGameData({ ...gameData, skills: gameData?.skills?.includes(skill) ? gameData?.skills?.filter(s => s !== skill) : [...gameData?.skills, skill] });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onCreateGame({ ...gameData, id: Date.now(), createdAt: new Date()?.toISOString(), createdBy: 'Current User', status: 'draft', participants: 0, rating: 0 });
      setIsSubmitting(false); onClose();
      setGameData({ title: '', description: '', category: '', difficulty: 'beginner', type: 'quiz', timeLimit: 300, maxParticipants: 50, skills: [], questions: [], isPublic: true, allowRetries: true, showLeaderboard: true });
      setCurrentStep(1);
    }, 2000);
  };

  const nextStep = () => currentStep < 3 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3"><Icon name="Plus" size={24} className="text-primary" /><div><h2 className="text-xl font-semibold text-foreground">Create New Game</h2><p className="text-sm text-muted-foreground">Step {currentStep} of 3</p></div></div>
          <Button variant="ghost" size="sm" iconName="X" onClick={onClose} />
        </div>
        <div className="px-6 py-4 bg-muted/30">
          <div className="flex items-center justify-between">
            {[1, 2, 3]?.map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{step}</div>
                {step < 3 && <div className={`w-20 h-1 mx-2 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground"><span>Basic Info</span><span>Configuration</span><span>Review</span></div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <Input label="Game Title" placeholder="Enter a compelling game title" value={gameData?.title} onChange={(e) => handleInputChange('title', e?.target?.value)} required />
              <div><label className="block text-sm font-medium text-foreground mb-2">Description</label><textarea className="w-full p-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground resize-none" rows={4} placeholder="Describe what players will learn and how the game works" value={gameData?.description} onChange={(e) => handleInputChange('description', e?.target?.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Select label="Category" options={categoryOptions} value={gameData?.category} onChange={(value) => handleInputChange('category', value)} required /><Select label="Difficulty Level" options={difficultyOptions} value={gameData?.difficulty} onChange={(value) => handleInputChange('difficulty', value)} /></div>
              <Select label="Game Type" options={typeOptions} value={gameData?.type} onChange={(value) => handleInputChange('type', value)} />
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Skills Covered</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{skillOptions?.map((skill) => (<label key={skill?.value} className="flex items-center gap-2 p-2 border border-border rounded-lg cursor-pointer hover:bg-accent/50"><Checkbox checked={gameData?.skills?.includes(skill?.value)} onChange={() => handleSkillToggle(skill?.value)} /><span className="text-sm text-foreground">{skill?.label}</span></label>))}</div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Time Limit (seconds)" type="number" min="60" max="3600" value={gameData?.timeLimit} onChange={(e) => handleInputChange('timeLimit', parseInt(e?.target?.value))} /><Input label="Max Participants" type="number" min="1" max="1000" value={gameData?.maxParticipants} onChange={(e) => handleInputChange('maxParticipants', parseInt(e?.target?.value))} /></div>
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Game Settings</h3>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg"><Checkbox checked={gameData?.isPublic} onChange={(e) => handleInputChange('isPublic', e?.target?.checked)} /><div><p className="font-medium text-foreground">Public Game</p><p className="text-sm text-muted-foreground">Allow all employees to discover and join this game</p></div></label>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg"><Checkbox checked={gameData?.allowRetries} onChange={(e) => handleInputChange('allowRetries', e?.target?.checked)} /><div><p className="font-medium text-foreground">Allow Retries</p><p className="text-sm text-muted-foreground">Players can retake the game to improve their score</p></div></label>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg"><Checkbox checked={gameData?.showLeaderboard} onChange={(e) => handleInputChange('showLeaderboard', e?.target?.checked)} /><div><p className="font-medium text-foreground">Show Leaderboard</p><p className="text-sm text-muted-foreground">Display player rankings and scores publicly</p></div></label>
              </div>
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2"><Icon name="Lightbulb" size={16} />Quick Setup Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => { handleInputChange('timeLimit', 180); handleInputChange('maxParticipants', 20); }}>Quick Quiz (3min)</Button>
                  <Button variant="outline" size="sm" onClick={() => { handleInputChange('timeLimit', 600); handleInputChange('maxParticipants', 100); }}>Standard Game (10min)</Button>
                  <Button variant="outline" size="sm" onClick={() => { handleInputChange('timeLimit', 1800); handleInputChange('maxParticipants', 500); }}>Challenge (30min)</Button>
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Icon name="Eye" size={18} />Game Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">{gameData?.title}</h4><p className="text-sm text-muted-foreground mb-4">{gameData?.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Category:</span><span className="text-foreground capitalize">{gameData?.category?.replace('-', ' ')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Difficulty:</span><span className="text-foreground capitalize">{gameData?.difficulty}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="text-foreground capitalize">{gameData?.type?.replace('-', ' ')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Time Limit:</span><span className="text-foreground">{Math.floor(gameData?.timeLimit / 60)}:{(gameData?.timeLimit % 60)?.toString()?.padStart(2, '0')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Max Players:</span><span className="text-foreground">{gameData?.maxParticipants}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Skills & Settings</h4>
                    <div className="flex flex-wrap gap-2 mb-4">{gameData?.skills?.map((skill) => (<span key={skill} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">{skillOptions?.find(s => s?.value === skill)?.label}</span>))}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"><Icon name={gameData?.isPublic ? "Globe" : "Lock"} size={14} /><span className="text-muted-foreground">{gameData?.isPublic ? "Public Game" : "Private Game"}</span></div>
                      <div className="flex items-center gap-2"><Icon name={gameData?.allowRetries ? "RotateCcw" : "X"} size={14} /><span className="text-muted-foreground">{gameData?.allowRetries ? "Retries Allowed" : "Single Attempt"}</span></div>
                      <div className="flex items-center gap-2"><Icon name={gameData?.showLeaderboard ? "Trophy" : "EyeOff"} size={14} /><span className="text-muted-foreground">{gameData?.showLeaderboard ? "Leaderboard Visible" : "Leaderboard Hidden"}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
                  <div><h4 className="font-medium text-foreground mb-1">Next Steps</h4><p className="text-sm text-muted-foreground">After creating this game, you'll need to add questions and content. The game will be saved as a draft until you publish it.</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <div className="flex gap-2">{currentStep > 1 && <Button variant="outline" iconName="ChevronLeft" iconPosition="left" onClick={prevStep}>Previous</Button>}</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            {currentStep < 3 ? <Button variant="default" iconName="ChevronRight" iconPosition="right" onClick={nextStep} disabled={!gameData?.title || !gameData?.category}>Next</Button> : <Button variant="default" iconName="Plus" iconPosition="left" onClick={handleSubmit} loading={isSubmitting} disabled={!gameData?.title || !gameData?.category}>Create Game</Button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCreationModal;