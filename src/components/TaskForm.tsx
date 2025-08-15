import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { X, Save, Calendar, Clock, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  onClose: () => void;
  onSave: () => void;
}

interface TaskData {
  subject: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  related_to_type: string;
}

const TaskForm = ({ onClose, onSave }: TaskFormProps) => {
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>({
    subject: '',
    description: '',
    status: 'open',
    priority: 'medium',
    due_date: '',
    related_to_type: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskData.subject) {
      toast({
        title: "Validation Error",
        description: "Task subject is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          due_date: taskData.due_date ? new Date(taskData.due_date).toISOString() : null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TaskData, value: string) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  // Get tomorrow's date for default due date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Create New Task
            </CardTitle>
            <CardDescription>Schedule a new task or follow-up</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Task Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Task Details
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={taskData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter task subject"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={taskData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter task description or notes"
                  rows={3}
                />
              </div>
            </div>

            {/* Task Properties */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Task Properties
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={taskData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="deferred">Deferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={taskData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Urgent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={taskData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
            </div>

            {/* Related Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Related To</h3>
              
              <div className="space-y-2">
                <Label htmlFor="related_to_type">Record Type</Label>
                <Select value={taskData.related_to_type} onValueChange={(value) => handleInputChange('related_to_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select related record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setTaskData(prev => ({ 
                      ...prev, 
                      subject: 'Follow up call',
                      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                    }));
                  }}
                >
                  Follow-up Call
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setTaskData(prev => ({ 
                      ...prev, 
                      subject: 'Send proposal',
                      priority: 'high',
                      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                    }));
                  }}
                >
                  Send Proposal
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setTaskData(prev => ({ 
                      ...prev, 
                      subject: 'Schedule meeting',
                      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                    }));
                  }}
                >
                  Schedule Meeting
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setTaskData(prev => ({ 
                      ...prev, 
                      subject: 'Send contract',
                      priority: 'high'
                    }));
                  }}
                >
                  Send Contract
                </Button>
              </div>
            </div>
          </CardContent>

          <div className="flex justify-end gap-2 p-6 pt-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Task
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TaskForm;