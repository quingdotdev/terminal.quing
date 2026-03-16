import React from 'react';
import { Terminal as TerminalIcon, Search, Columns, Command, Sun } from 'lucide-react';
import { cn } from '../utils/cn';

interface OnboardingStep {
  title: string;
  content: string | React.ReactNode;
  icon: React.ReactNode;
}

interface OnboardingProps {
  step: number;
  onStepChange: (step: number | ((prev: number) => number)) => void;
  onComplete: () => void;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    title: 'welcome to terminal by Quing',
    content: "a high-performance, customizable terminal emulator for modern workflows. let's take a quick tour of the features.",
    icon: <TerminalIcon size={48} />,
  },
  {
    title: 'command palette',
    content: 'press Ctrl + Shift + P to open the command palette. search and execute any action instantly without leaving your keyboard.',
    icon: <Search size={48} />,
  },
  {
    title: 'split tabs & panes',
    content: 'right-click any tab to split it into multiple panes. organize your workspace by seeing multiple shells side-by-side.',
    icon: <Columns size={48} />,
  },
  {
    title: 'keyboard shortcuts',
    content: (
      <ul className="text-left space-y-2 text-sm mt-4">
        <li><kbd className="px-2 py-1 bg-[var(--cornflower)] rounded">Alt + 1-9</kbd> Switch Projects</li>
        <li><kbd className="px-2 py-1 bg-[var(--cornflower)] rounded">Ctrl + 1-9</kbd> Switch Tabs</li>
        <li><kbd className="px-2 py-1 bg-[var(--cornflower)] rounded">Ctrl + Shift + 1-3</kbd> New Terminal</li>
        <li><kbd className="px-2 py-1 bg-[var(--cornflower)] rounded">Ctrl + ,</kbd> Settings</li>
      </ul>
    ),
    icon: <Command size={48} />,
  },
  {
    title: 'ready to go',
    content: 'your workspace is automatically saved. double-click any tab or project name to rename it. enjoy your new terminal!',
    icon: <Sun size={48} />,
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ step, onStepChange, onComplete }) => {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[var(--start)] border border-[var(--cornflower)] shadow-2xl rounded-lg overflow-hidden p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="mb-6 p-4 bg-[var(--cornflower)]/20 rounded-full">
          {onboardingSteps[step].icon}
        </div>
        <h2 className="text-2xl font-bold mb-4 lowercase tracking-tight">
          {onboardingSteps[step].title}
        </h2>
        <div className="text-[var(--charcoal)] opacity-80 mb-8 min-h-[100px] flex flex-col justify-center">
          {typeof onboardingSteps[step].content === 'string' ? (
            <p className="lowercase leading-relaxed">{onboardingSteps[step].content}</p>
          ) : (
            onboardingSteps[step].content
          )}
        </div>

        <div className="flex items-center justify-between w-full mt-auto">
          <div className="flex gap-1">
            {onboardingSteps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  idx === step ? 'w-6 bg-[var(--charcoal)]' : 'bg-[var(--cornflower)]'
                )}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onComplete}
              className="px-4 py-2 text-sm lowercase opacity-50 hover:opacity-100 transition-opacity"
            >
              skip
            </button>
            <button
              onClick={() => {
                if (step < onboardingSteps.length - 1) {
                  onStepChange((prev) => prev + 1);
                } else {
                  onComplete();
                }
              }}
              className="px-6 py-2 bg-[var(--charcoal)] text-[var(--start)] rounded-md text-sm font-semibold lowercase hover:opacity-90 transition-opacity shadow-lg"
            >
              {step === onboardingSteps.length - 1 ? 'get started' : 'next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
