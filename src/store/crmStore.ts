import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lead, Deal, Task, Activity, AIInsight, Conversation, DashboardStats, PipelineStats } from '@/types';
import { sampleLeads, sampleDeals, sampleTasks, sampleActivities, sampleInsights, sampleConversations } from '@/data/sampleData';

interface CRMState {
  // Data
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  insights: AIInsight[];
  conversations: Conversation[];
  
  // Actions - Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  getLeadById: (id: string) => Lead | undefined;
  
  // Actions - Deals
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  moveDealStage: (id: string, newStage: Deal['stage']) => void;
  getDealById: (id: string) => Deal | undefined;
  
  // Actions - Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  
  // Actions - Activities
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  getActivitiesForLead: (leadId: string) => Activity[];
  getActivitiesForDeal: (dealId: string) => Activity[];
  
  // Actions - Conversations
  addConversation: (conversation: Omit<Conversation, 'id' | 'createdAt'>) => void;
  getConversationsForLead: (leadId: string) => Conversation[];
  
  // Getters
  getDashboardStats: () => DashboardStats;
  getPipelineStats: () => PipelineStats[];
  getRecentActivities: (limit?: number) => Activity[];
  getOverdueTasks: () => Task[];
  getTasksDueToday: () => Task[];
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      leads: sampleLeads,
      deals: sampleDeals,
      tasks: sampleTasks,
      activities: sampleActivities,
      insights: sampleInsights,
      conversations: sampleConversations,

      // Lead Actions
      addLead: (leadData) => {
        const newLead: Lead = {
          ...leadData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ leads: [newLead, ...state.leads] }));
        
        // Add activity
        get().addActivity({
          type: 'note',
          title: 'New Lead Created',
          description: `Lead "${newLead.name}" was created`,
          performedBy: newLead.assignedTo,
          performedByName: 'System',
          relatedTo: { type: 'lead', id: newLead.id, name: newLead.name },
        });
      },

      updateLead: (id, updates) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === id ? { ...lead, ...updates, updatedAt: new Date() } : lead
          ),
        }));
      },

      deleteLead: (id) => {
        set(state => ({
          leads: state.leads.filter(lead => lead.id !== id),
        }));
      },

      getLeadById: (id) => {
        return get().leads.find(lead => lead.id === id);
      },

      // Deal Actions
      addDeal: (dealData) => {
        const newDeal: Deal = {
          ...dealData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ deals: [newDeal, ...state.deals] }));
        
        get().addActivity({
          type: 'deal_stage_change',
          title: 'New Deal Created',
          description: `Deal "${newDeal.title}" worth $${newDeal.value.toLocaleString()} was created`,
          performedBy: newDeal.assignedTo,
          performedByName: 'System',
          relatedTo: { type: 'deal', id: newDeal.id, name: newDeal.title },
        });
      },

      updateDeal: (id, updates) => {
        set(state => ({
          deals: state.deals.map(deal =>
            deal.id === id ? { ...deal, ...updates, updatedAt: new Date() } : deal
          ),
        }));
      },

      deleteDeal: (id) => {
        set(state => ({
          deals: state.deals.filter(deal => deal.id !== id),
        }));
      },

      moveDealStage: (id, newStage) => {
        const deal = get().deals.find(d => d.id === id);
        if (deal) {
          const oldStage = deal.stage;
          get().updateDeal(id, { stage: newStage });
          
          get().addActivity({
            type: 'deal_stage_change',
            title: 'Deal Stage Changed',
            description: `Moved from "${oldStage}" to "${newStage}"`,
            performedBy: deal.assignedTo,
            performedByName: 'System',
            relatedTo: { type: 'deal', id: deal.id, name: deal.title },
            metadata: { oldStage, newStage },
          });
        }
      },

      getDealById: (id) => {
        return get().deals.find(deal => deal.id === id);
      },

      // Task Actions
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ tasks: [newTask, ...state.tasks] }));
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id),
        }));
      },

      completeTask: (id) => {
        get().updateTask(id, { 
          status: 'completed', 
          completedAt: new Date() 
        });
      },

      getTaskById: (id) => {
        return get().tasks.find(task => task.id === id);
      },

      // Activity Actions
      addActivity: (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
        };
        set(state => ({ activities: [newActivity, ...state.activities] }));
      },

      getActivitiesForLead: (leadId) => {
        return get().activities.filter(
          activity => activity.relatedTo?.type === 'lead' && activity.relatedTo?.id === leadId
        );
      },

      getActivitiesForDeal: (dealId) => {
        return get().activities.filter(
          activity => activity.relatedTo?.type === 'deal' && activity.relatedTo?.id === dealId
        );
      },

      // Conversation Actions
      addConversation: (conversationData) => {
        const newConversation: Conversation = {
          ...conversationData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
        };
        set(state => ({ conversations: [newConversation, ...state.conversations] }));
      },

      getConversationsForLead: (leadId) => {
        return get().conversations.filter(
          conv => conv.relatedTo?.type === 'lead' && conv.relatedTo?.id === leadId
        );
      },

      // Getters
      getDashboardStats: () => {
        const { leads, deals, tasks } = get();
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const newLeadsThisMonth = leads.filter(l => {
          const d = new Date(l.createdAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;
        
        const dealsThisMonth = deals.filter(d => {
          const date = new Date(d.createdAt);
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        });
        
        const closedDeals = deals.filter(d => d.stage === 'closed_won');
        const totalRevenue = closedDeals.reduce((sum, d) => sum + d.value, 0);
        
        const revenueThisMonth = deals
          .filter(d => {
            if (d.stage !== 'closed_won') return false;
            const date = new Date(d.actualCloseDate || d.createdAt);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
          })
          .reduce((sum, d) => sum + d.value, 0);
        
        const conversionRate = leads.length > 0 
          ? Math.round((closedDeals.length / leads.length) * 100) 
          : 0;
        
        const activeTasks = tasks.filter(t => t.status !== 'completed').length;
        const overdueTasks = tasks.filter(t => 
          t.status !== 'completed' && new Date(t.dueDate) < now
        ).length;
        
        return {
          totalLeads: leads.length,
          newLeadsThisMonth,
          totalDeals: deals.length,
          dealsThisMonth: dealsThisMonth.length,
          totalRevenue,
          revenueThisMonth,
          conversionRate,
          activeTasks,
          overdueTasks,
        };
      },

      getPipelineStats: () => {
        const { deals } = get();
        const stages: Deal['stage'][] = ['new_lead', 'contacted', 'qualified', 'negotiation', 'closed_won', 'closed_lost'];
        
        return stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          return {
            stage,
            count: stageDeals.length,
            value: stageDeals.reduce((sum, d) => sum + d.value, 0),
          };
        });
      },

      getRecentActivities: (limit = 10) => {
        return get().activities.slice(0, limit);
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(
          t => t.status !== 'completed' && new Date(t.dueDate) < now
        );
      },

      getTasksDueToday: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return get().tasks.filter(t => {
          const dueDate = new Date(t.dueDate);
          return t.status !== 'completed' && dueDate >= today && dueDate < tomorrow;
        });
      },
    }),
    {
      name: 'nexuscrm-data',
    }
  )
);
