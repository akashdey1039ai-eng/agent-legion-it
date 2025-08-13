-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  department TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profile access
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert dummy user profiles
INSERT INTO public.profiles (display_name, email, role, department, bio) VALUES
('Sarah Chen', 'sarah.chen@aicommand.mil', 'commander', 'Strategic Operations', 'Lead commander overseeing AI deployment strategies and cross-department coordination.'),
('Marcus Rodriguez', 'marcus.rodriguez@aicommand.mil', 'admin', 'System Administration', 'Senior system administrator managing AI infrastructure and security protocols.'),
('Dr. Elena Volkov', 'elena.volkov@aicommand.mil', 'analyst', 'AI Research', 'Lead AI researcher specializing in machine learning algorithms and neural network optimization.'),
('James Mitchell', 'james.mitchell@aicommand.mil', 'operator', 'Field Operations', 'Field operations specialist managing real-time AI agent deployments.'),
('Aisha Patel', 'aisha.patel@aicommand.mil', 'analyst', 'Data Intelligence', 'Senior data analyst focusing on pattern recognition and predictive modeling.'),
('Captain Tom Bradley', 'tom.bradley@aicommand.mil', 'commander', 'Tactical Division', 'Tactical operations commander specializing in combat AI systems.'),
('Lisa Wang', 'lisa.wang@aicommand.mil', 'operator', 'Surveillance', 'Surveillance operations specialist managing reconnaissance AI agents.'),
('David Thompson', 'david.thompson@aicommand.mil', 'technician', 'Maintenance', 'Senior technician responsible for AI system maintenance and upgrades.'),
('Dr. Maria Santos', 'maria.santos@aicommand.mil', 'analyst', 'Behavioral Analysis', 'Behavioral analyst studying AI decision-making patterns and ethics.'),
('Alex Johnson', 'alex.johnson@aicommand.mil', 'operator', 'Communications', 'Communications specialist managing AI-human interface protocols.'),
('Colonel Rebecca Stone', 'rebecca.stone@aicommand.mil', 'commander', 'Strategic Planning', 'Strategic planning commander overseeing long-term AI integration initiatives.'),
('Ryan Kim', 'ryan.kim@aicommand.mil', 'technician', 'Hardware', 'Hardware specialist managing AI processing units and infrastructure.'),
('Dr. Hassan Ali', 'hassan.ali@aicommand.mil', 'analyst', 'Threat Assessment', 'Threat assessment analyst specializing in AI security vulnerabilities.'),
('Jenny Foster', 'jenny.foster@aicommand.mil', 'operator', 'Logistics', 'Logistics coordinator managing AI resource allocation and deployment schedules.'),
('Michael Chang', 'michael.chang@aicommand.mil', 'admin', 'Network Security', 'Network security administrator protecting AI communication channels.'),
('Dr. Samantha Green', 'samantha.green@aicommand.mil', 'analyst', 'Performance Metrics', 'Performance analyst monitoring AI efficiency and optimization opportunities.'),
('Tony Russo', 'tony.russo@aicommand.mil', 'technician', 'Field Support', 'Field support technician providing on-site AI system maintenance.'),
('Commander Lisa Park', 'lisa.park@aicommand.mil', 'commander', 'Training Division', 'Training division commander overseeing AI operator certification programs.'),
('Nathan Brooks', 'nathan.brooks@aicommand.mil', 'operator', 'Emergency Response', 'Emergency response specialist coordinating AI crisis management protocols.'),
('Dr. Rachel Turner', 'rachel.turner@aicommand.mil', 'analyst', 'Innovation Lab', 'Innovation researcher developing next-generation AI capabilities.');