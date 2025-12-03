'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Brain, Zap, TrendingUp, Target, Layers, Activity } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    description: string;
    icon: any;
    color: string;
    details: string[];
}

export default function EnginePage() {
    const [activeStep, setActiveStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const steps: Step[] = [
        {
            id: 1,
            title: "User Profile Encoding",
            description: "Convert your watch history into a numerical representation",
            icon: Target,
            color: "from-blue-500 to-cyan-500",
            details: [
                "Analyze your last 50 watched movies",
                "Extract movie embeddings from our trained model",
                "Create a temporal sequence of your viewing patterns",
                "Weight recent movies more heavily than older ones"
            ]
        },
        {
            id: 2,
            title: "Transformer Processing",
            description: "Our neural network analyzes your taste patterns",
            icon: Brain,
            color: "from-purple-500 to-pink-500",
            details: [
                "Multi-head attention mechanism identifies patterns",
                "8 attention heads process different aspects of your taste",
                "4 transformer layers build complex representations",
                "Positional encoding captures viewing sequence importance"
            ]
        },
        {
            id: 3,
            title: "Candidate Generation",
            description: "Generate potential movie recommendations",
            icon: Layers,
            color: "from-green-500 to-emerald-500",
            details: [
                "Query our database of 27,000+ movies",
                "Use learned embeddings to find similar content",
                "Filter out movies you've already watched",
                "Generate top 1000 candidate recommendations"
            ]
        },
        {
            id: 4,
            title: "Scoring & Ranking",
            description: "Rank candidates based on predicted preference",
            icon: TrendingUp,
            color: "from-orange-500 to-red-500",
            details: [
                "Calculate similarity scores for each candidate",
                "Apply collaborative filtering techniques",
                "Boost diversity to avoid echo chambers",
                "Rank by predicted rating (0-10 scale)"
            ]
        },
        {
            id: 5,
            title: "Real-time Delivery",
            description: "Serve personalized recommendations instantly",
            icon: Zap,
            color: "from-yellow-500 to-orange-500",
            details: [
                "Cache user embeddings in Redis for speed",
                "Serve recommendations in <100ms",
                "Update continuously as you watch more",
                "Adapt to your evolving taste in real-time"
            ]
        }
    ];

    const metrics = [
        { label: "Model Parameters", value: "2.1M", icon: Brain },
        { label: "Training Movies", value: "27K+", icon: Layers },
        { label: "Embedding Dim", value: "128", icon: Activity },
        { label: "Avg Response", value: "<100ms", icon: Zap }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setActiveStep((prev) => (prev + 1) % steps.length);
                setIsAnimating(false);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 mb-6">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Recommendation Engine
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Powered by a Transformer-based neural network trained on millions of movie interactions
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <div key={metric.label} className="glass rounded-xl p-6 text-center">
                                <Icon className="w-8 h-8 text-red-500 mx-auto mb-3" />
                                <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                                <div className="text-sm text-gray-400">{metric.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Pipeline Visualization */}
                <div className="glass rounded-2xl p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        How It Works: 5-Step Pipeline
                    </h2>

                    {/* Steps Timeline */}
                    <div className="relative mb-12">
                        {/* Progress Line */}
                        <div className="absolute top-12 left-0 right-0 h-1 bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-1000 ease-out"
                                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>

                        {/* Step Circles */}
                        <div className="relative flex justify-between">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index === activeStep;
                                const isPast = index < activeStep;

                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveStep(index)}
                                        className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'
                                            }`}
                                    >
                                        <div
                                            className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${isActive
                                                    ? `bg-gradient-to-br ${step.color} shadow-lg shadow-red-500/50`
                                                    : isPast
                                                        ? 'bg-red-600/50'
                                                        : 'bg-white/10'
                                                }`}
                                        >
                                            <Icon className={`w-10 h-10 ${isActive || isPast ? 'text-white' : 'text-gray-500'}`} />
                                        </div>
                                        <span className={`text-xs font-medium text-center max-w-[100px] ${isActive ? 'text-white' : 'text-gray-400'
                                            }`}>
                                            Step {step.id}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Step Details */}
                    <div
                        className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
                            }`}
                    >
                        <div className={`bg-gradient-to-br ${steps[activeStep].color} rounded-xl p-8 text-white`}>
                            <div className="flex items-start space-x-4 mb-6">
                                {(() => {
                                    const Icon = steps[activeStep].icon;
                                    return <Icon className="w-12 h-12 flex-shrink-0" />;
                                })()}
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">{steps[activeStep].title}</h3>
                                    <p className="text-white/90 text-lg">{steps[activeStep].description}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {steps[activeStep].details.map((detail, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start space-x-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-sm font-bold">{idx + 1}</span>
                                        </div>
                                        <p className="text-white/90">{detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Architecture */}
                <div className="glass rounded-2xl p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Technical Architecture</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Model Architecture */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Brain className="w-5 h-5 mr-2 text-red-500" />
                                Neural Network
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-300">Architecture</span>
                                        <span className="text-white font-mono text-sm">Transformer</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-300">Embedding Dimension</span>
                                        <span className="text-white font-mono text-sm">128</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '64%' }} />
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-300">Attention Heads</span>
                                        <span className="text-white font-mono text-sm">8</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '50%' }} />
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-300">Transformer Layers</span>
                                        <span className="text-white font-mono text-sm">4</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '40%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Training Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-red-500" />
                                Training Details
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="text-sm text-gray-400 mb-1">Dataset</div>
                                    <div className="text-white font-semibold">MovieLens 25M</div>
                                    <div className="text-xs text-gray-500 mt-1">25 million ratings, 27K movies</div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="text-sm text-gray-400 mb-1">Training Objective</div>
                                    <div className="text-white font-semibold">Next Movie Prediction</div>
                                    <div className="text-xs text-gray-500 mt-1">Masked sequence modeling</div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="text-sm text-gray-400 mb-1">Optimization</div>
                                    <div className="text-white font-semibold">AdamW Optimizer</div>
                                    <div className="text-xs text-gray-500 mt-1">Learning rate: 1e-4, Batch: 256</div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="text-sm text-gray-400 mb-1">Performance</div>
                                    <div className="text-white font-semibold">Hit@10: 0.42</div>
                                    <div className="text-xs text-gray-500 mt-1">42% accuracy in top-10 predictions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Features */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass rounded-xl p-6">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                            <Brain className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Deep Learning</h3>
                        <p className="text-gray-400 text-sm">
                            State-of-the-art Transformer architecture captures complex patterns in your viewing behavior
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                        <p className="text-gray-400 text-sm">
                            Redis caching and optimized inference deliver recommendations in under 100 milliseconds
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Continuously Learning</h3>
                        <p className="text-gray-400 text-sm">
                            Your recommendations improve with every movie you watch, adapting to your evolving taste
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
