import React from 'react';
import { motion } from 'framer-motion';

// Abstract wave background illustration
export const WaveBackground: React.FC<{
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  animate?: boolean;
}> = ({
  className = "",
  primaryColor = "#3b82f6",
  secondaryColor = "#8b5cf6",
  animate = true
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          initial={{ d: "M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
          animate={animate ? {
            d: [
              "M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ]
          } : undefined}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          fill={primaryColor}
          fillOpacity="0.6"
        />
        <motion.path
          initial={{ d: "M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
          animate={animate ? {
            d: [
              "M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,213.3C960,192,1056,160,1152,160C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ]
          } : undefined}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          fill={secondaryColor}
          fillOpacity="0.4"
        />
      </svg>
    </div>
  );
};

// Brain network illustration for AI/ML concepts
export const BrainNetworkIllustration: React.FC<{
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  animate?: boolean;
}> = ({
  className = "",
  primaryColor = "#3b82f6",
  secondaryColor = "#8b5cf6",
  animate = true
}) => {
  // Generate random nodes and connections
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 240,
    y: 30 + Math.random() * 140,
    radius: 3 + Math.random() * 5
  }));

  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    const numConnections = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numConnections; j++) {
      const target = Math.floor(Math.random() * nodes.length);
      if (target !== i) {
        connections.push({
          source: i,
          target,
          id: `${i}-${target}`
        });
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 300 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Brain outline */}
        <motion.path
          d="M150,30 C190,20 220,40 230,70 C240,100 230,130 210,150 C190,170 160,180 150,180 C140,180 110,170 90,150 C70,130 60,100 70,70 C80,40 110,20 150,30 Z"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2"
          strokeOpacity="0.5"
          initial={{ pathLength: 0 }}
          animate={animate ? { pathLength: 1 } : undefined}
          transition={{ duration: 3, ease: "easeInOut" }}
        />

        {/* Connections */}
        {connections.map((connection) => {
          const source = nodes[connection.source];
          const target = nodes[connection.target];
          return (
            <motion.line
              key={connection.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={secondaryColor}
              strokeWidth="1"
              strokeOpacity="0.6"
              initial={{ pathLength: 0 }}
              animate={animate ? { 
                pathLength: 1,
                strokeOpacity: [0.2, 0.6, 0.2]
              } : undefined}
              transition={{ 
                pathLength: { duration: 2, delay: Math.random() * 2 },
                strokeOpacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill={primaryColor}
            initial={{ scale: 0 }}
            animate={animate ? { 
              scale: 1,
              r: [node.radius, node.radius * 1.3, node.radius]
            } : undefined}
            transition={{ 
              scale: { duration: 0.5, delay: Math.random() },
              r: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: Math.random() * 2 }
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// Chat bubble illustration for conversation interfaces
export const ChatBubbleIllustration: React.FC<{
  className?: string;
  userColor?: string;
  agentColor?: string;
  animate?: boolean;
}> = ({
  className = "",
  userColor = "#3b82f6",
  agentColor = "#8b5cf6",
  animate = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 300 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* User bubble */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={animate ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <path
            d="M120,50 L40,50 C35,50 30,55 30,60 L30,100 C30,105 35,110 40,110 L50,110 L60,130 L70,110 L120,110 C125,110 130,105 130,100 L130,60 C130,55 125,50 120,50 Z"
            fill={userColor}
            fillOpacity="0.8"
          />
          <circle cx="50" cy="80" r="5" fill="white" />
          <circle cx="80" cy="80" r="5" fill="white" />
          <circle cx="110" cy="80" r="5" fill="white" />
        </motion.g>

        {/* Agent bubble */}
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={animate ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <path
            d="M180,90 L260,90 C265,90 270,95 270,100 L270,140 C270,145 265,150 260,150 L250,150 L240,170 L230,150 L180,150 C175,150 170,145 170,140 L170,100 C170,95 175,90 180,90 Z"
            fill={agentColor}
            fillOpacity="0.8"
          />
          <rect x="190" y="110" width="60" height="5" rx="2" fill="white" />
          <rect x="190" y="120" width="40" height="5" rx="2" fill="white" />
          <rect x="190" y="130" width="50" height="5" rx="2" fill="white" />
        </motion.g>
      </svg>
    </div>
  );
};

// Workflow process illustration
export const WorkflowIllustration: React.FC<{
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  animate?: boolean;
}> = ({
  className = "",
  primaryColor = "#3b82f6",
  secondaryColor = "#8b5cf6",
  accentColor = "#ef4444",
  animate = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Nodes */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5 }}
        >
          {/* Start node */}
          <motion.circle
            cx="50"
            cy="100"
            r="20"
            fill={primaryColor}
            initial={{ scale: 0 }}
            animate={animate ? { scale: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.text
            x="50"
            y="105"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Start
          </motion.text>

          {/* Process node 1 */}
          <motion.rect
            x="110"
            y="80"
            width="60"
            height="40"
            rx="5"
            fill={secondaryColor}
            initial={{ scale: 0 }}
            animate={animate ? { scale: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          <motion.text
            x="140"
            y="105"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Process
          </motion.text>

          {/* Decision node */}
          <motion.path
            d="M220,100 L250,80 L280,100 L250,120 Z"
            fill={accentColor}
            initial={{ scale: 0 }}
            animate={animate ? { scale: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.6 }}
          />
          <motion.text
            x="250"
            y="105"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            Decision
          </motion.text>

          {/* End node */}
          <motion.circle
            cx="350"
            cy="100"
            r="20"
            fill={primaryColor}
            initial={{ scale: 0 }}
            animate={animate ? { scale: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
          <motion.text
            x="350"
            y="105"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            End
          </motion.text>
        </motion.g>

        {/* Connections */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {/* Start to Process */}
          <motion.line
            x1="70"
            y1="100"
            x2="110"
            y2="100"
            stroke={primaryColor}
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={animate ? { pathLength: 1 } : undefined}
            transition={{ duration: 1, delay: 1.2 }}
          />
          <motion.polygon
            points="105,95 115,100 105,105"
            fill={primaryColor}
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: 1.7 }}
          />

          {/* Process to Decision */}
          <motion.line
            x1="170"
            y1="100"
            x2="220"
            y2="100"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={animate ? { pathLength: 1 } : undefined}
            transition={{ duration: 1, delay: 1.4 }}
          />
          <motion.polygon
            points="215,95 225,100 215,105"
            fill={secondaryColor}
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: 1.9 }}
          />

          {/* Decision to End */}
          <motion.line
            x1="280"
            y1="100"
            x2="330"
            y2="100"
            stroke={accentColor}
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={animate ? { pathLength: 1 } : undefined}
            transition={{ duration: 1, delay: 1.6 }}
          />
          <motion.polygon
            points="325,95 335,100 325,105"
            fill={accentColor}
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: 2.1 }}
          />
        </motion.g>
      </svg>
    </div>
  );
};

// Agent collaboration illustration
export const AgentCollaborationIllustration: React.FC<{
  className?: string;
  agentColors?: string[];
  animate?: boolean;
}> = ({
  className = "",
  agentColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
  animate = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Central hub */}
        <motion.circle
          cx="200"
          cy="150"
          r="30"
          fill="#1f2937"
          stroke="white"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={animate ? { scale: 1 } : undefined}
          transition={{ duration: 0.8, type: "spring" }}
        />
        <motion.text
          x="200"
          y="155"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          Hub
        </motion.text>

        {/* Agent nodes */}
        {[
          { x: 100, y: 80, label: "Research" },
          { x: 300, y: 80, label: "Writing" },
          { x: 100, y: 220, label: "Analysis" },
          { x: 300, y: 220, label: "Design" },
          { x: 200, y: 40, label: "Manager" }
        ].map((agent, index) => (
          <motion.g key={index}>
            <motion.circle
              cx={agent.x}
              cy={agent.y}
              r="25"
              fill={agentColors[index % agentColors.length]}
              initial={{ scale: 0 }}
              animate={animate ? { scale: 1 } : undefined}
              transition={{ duration: 0.6, delay: 0.2 * index, type: "spring" }}
            />
            <motion.text
              x={agent.x}
              y={agent.y + 5}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={animate ? { opacity: 1 } : undefined}
              transition={{ duration: 0.5, delay: 0.8 + 0.1 * index }}
            >
              {agent.label}
            </motion.text>

            {/* Connection to hub */}
            <motion.line
              x1={agent.x}
              y1={agent.y}
              x2="200"
              y2="150"
              stroke="white"
              strokeWidth="2"
              strokeOpacity="0.6"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={animate ? { pathLength: 1 } : undefined}
              transition={{ duration: 1, delay: 0.5 + 0.1 * index }}
            />

            {/* Data packets */}
            {animate && (
              <motion.circle
                cx={agent.x}
                cy={agent.y}
                r="4"
                fill="white"
                animate={{
                  cx: [agent.x, 200],
                  cy: [agent.y, 150],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: 1.5 + 0.2 * index,
                  repeat: Infinity,
                  repeatDelay: 3 + Math.random() * 2
                }}
              />
            )}
          </motion.g>
        ))}

        {/* Pulse effect around hub */}
        {animate && (
          <>
            <motion.circle
              cx="200"
              cy="150"
              r="30"
              fill="transparent"
              stroke="white"
              strokeWidth="2"
              strokeOpacity="0.5"
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx="200"
              cy="150"
              r="30"
              fill="transparent"
              stroke="white"
              strokeWidth="2"
              strokeOpacity="0.3"
              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}
      </svg>
    </div>
  );
};

// Learning and improvement illustration
export const LearningIllustration: React.FC<{
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  animate?: boolean;
}> = ({
  className = "",
  primaryColor = "#3b82f6",
  secondaryColor = "#10b981",
  animate = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Graph background */}
        <motion.rect
          x="50"
          y="40"
          width="300"
          height="120"
          rx="5"
          fill="#1f2937"
          fillOpacity="0.3"
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5 }}
        />

        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <motion.line
            key={`h-${i}`}
            x1="50"
            y1={40 + i * 40}
            x2="350"
            y2={40 + i * 40}
            stroke="white"
            strokeOpacity="0.2"
            strokeDasharray="5,5"
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.1 * i }}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <motion.line
            key={`v-${i}`}
            x1={50 + i * 50}
            y1="40"
            x2={50 + i * 50}
            y2="160"
            stroke="white"
            strokeOpacity="0.2"
            strokeDasharray="5,5"
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.1 * i }}
          />
        ))}

        {/* Performance line */}
        <motion.path
          d="M50,120 C100,110 150,90 200,80 C250,70 300,50 350,40"
          fill="none"
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={animate ? { pathLength: 1 } : undefined}
          transition={{ duration: 2, delay: 0.5 }}
        />

        {/* Data points */}
        {[
          { x: 50, y: 120 },
          { x: 100, y: 110 },
          { x: 150, y: 90 },
          { x: 200, y: 80 },
          { x: 250, y: 70 },
          { x: 300, y: 50 },
          { x: 350, y: 40 }
        ].map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={primaryColor}
            initial={{ scale: 0 }}
            animate={animate ? { scale: 1 } : undefined}
            transition={{ duration: 0.3, delay: 0.8 + 0.1 * index }}
          />
        ))}

        {/* Improvement markers */}
        {[
          { x: 150, y: 90, label: "Feedback" },
          { x: 250, y: 70, label: "Training" },
          { x: 350, y: 40, label: "Optimized" }
        ].map((marker, index) => (
          <motion.g key={index}>
            <motion.line
              x1={marker.x}
              y1={marker.y}
              x2={marker.x}
              y2={marker.y - 20}
              stroke={secondaryColor}
              strokeWidth="2"
              strokeDasharray="3,3"
              initial={{ pathLength: 0 }}
              animate={animate ? { pathLength: 1 } : undefined}
              transition={{ duration: 0.5, delay: 1.5 + 0.2 * index }}
            />
            <motion.rect
              x={marker.x - 30}
              y={marker.y - 40}
              width="60"
              height="20"
              rx="5"
              fill={secondaryColor}
              initial={{ opacity: 0 }}
              animate={animate ? { opacity: 1 } : undefined}
              transition={{ duration: 0.5, delay: 1.8 + 0.2 * index }}
            />
            <motion.text
              x={marker.x}
              y={marker.y - 25}
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={animate ? { opacity: 1 } : undefined}
              transition={{ duration: 0.5, delay: 2 + 0.2 * index }}
            >
              {marker.label}
            </motion.text>
          </motion.g>
        ))}

        {/* Axis labels */}
        <motion.text
          x="200"
          y="180"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 2.5 }}
        >
          Time
        </motion.text>
        <motion.text
          x="30"
          y="100"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          transform="rotate(-90, 30, 100)"
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 2.5 }}
        >
          Performance
        </motion.text>
      </svg>
    </div>
  );
};

export default {
  WaveBackground,
  BrainNetworkIllustration,
  ChatBubbleIllustration,
  WorkflowIllustration,
  AgentCollaborationIllustration,
  LearningIllustration
};
