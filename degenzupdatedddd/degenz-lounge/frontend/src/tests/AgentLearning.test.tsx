import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import AgentLearning from '../components/learning/AgentLearning';
import FeedbackComponent from '../components/feedback/FeedbackComponent';
import AgentFeedbackDashboard from '../components/feedback/AgentFeedbackDashboard';
import PerformanceAnalytics from '../components/analytics/PerformanceAnalytics';
import AgentImprovementSuggestions from '../components/improvement/AgentImprovementSuggestions';
import AgentFineTuning from '../components/tuning/AgentFineTuning';
import ABTesting from '../components/testing/ABTesting';

// Mock the components
jest.mock('../components/feedback/FeedbackComponent', () => {
  return jest.fn(() => <div data-testid="feedback-component">Feedback Component</div>);
});

jest.mock('../components/feedback/AgentFeedbackDashboard', () => {
  return jest.fn(() => <div data-testid="feedback-dashboard">Feedback Dashboard</div>);
});

jest.mock('../components/analytics/PerformanceAnalytics', () => {
  return jest.fn(() => <div data-testid="performance-analytics">Performance Analytics</div>);
});

jest.mock('../components/analytics/AgentMetricsControlPanel', () => {
  return jest.fn(() => <div data-testid="metrics-control-panel">Metrics Control Panel</div>);
});

jest.mock('../components/improvement/AgentImprovementSuggestions', () => {
  return jest.fn(() => <div data-testid="improvement-suggestions">Improvement Suggestions</div>);
});

jest.mock('../components/tuning/AgentFineTuning', () => {
  return jest.fn(() => <div data-testid="fine-tuning">Fine Tuning</div>);
});

jest.mock('../components/testing/ABTesting', () => {
  return jest.fn(() => <div data-testid="ab-testing">A/B Testing</div>);
});

describe('AgentLearning Component', () => {
  const queryClient = new QueryClient();
  const agentId = 1;
  const agentName = 'Test Agent';

  beforeEach(() => {
    render(
      <QueryClientProvider client={queryClient}>
        <AgentLearning agentId={agentId} agentName={agentName} />
      </QueryClientProvider>
    );
  });

  test('renders the component with feedback tab active by default', () => {
    expect(screen.getByText('Agent Learning & Improvement')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-component')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-dashboard')).toBeInTheDocument();
  });

  test('switches to performance tab when clicked', () => {
    fireEvent.click(screen.getByText('Performance'));
    expect(screen.getByTestId('performance-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('metrics-control-panel')).toBeInTheDocument();
  });

  test('switches to improvement suggestions tab when clicked', () => {
    fireEvent.click(screen.getByText('Improvement Suggestions'));
    expect(screen.getByTestId('improvement-suggestions')).toBeInTheDocument();
  });

  test('switches to fine-tuning tab when clicked', () => {
    fireEvent.click(screen.getByText('Fine-Tuning'));
    expect(screen.getByTestId('fine-tuning')).toBeInTheDocument();
  });

  test('switches to A/B testing tab when clicked', () => {
    fireEvent.click(screen.getByText('A/B Testing'));
    expect(screen.getByTestId('ab-testing')).toBeInTheDocument();
  });

  test('passes correct props to child components', () => {
    // Check FeedbackComponent props
    expect(FeedbackComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: agentId,
        onFeedbackSubmitted: expect.any(Function)
      }),
      expect.anything()
    );

    // Check AgentFeedbackDashboard props
    expect(AgentFeedbackDashboard).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: agentId,
        agentName: agentName
      }),
      expect.anything()
    );

    // Switch to other tabs and check props
    fireEvent.click(screen.getByText('Performance'));
    expect(PerformanceAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: agentId,
        agentName: agentName
      }),
      expect.anything()
    );

    fireEvent.click(screen.getByText('Improvement Suggestions'));
    expect(AgentImprovementSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: agentId,
        agentName: agentName
      }),
      expect.anything()
    );

    fireEvent.click(screen.getByText('Fine-Tuning'));
    expect(AgentFineTuning).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: agentId,
        agentName: agentName
      }),
      expect.anything()
    );

    fireEvent.click(screen.getByText('A/B Testing'));
    expect(ABTesting).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: agentId,
        agentName: agentName
      }),
      expect.anything()
    );
  });
});
