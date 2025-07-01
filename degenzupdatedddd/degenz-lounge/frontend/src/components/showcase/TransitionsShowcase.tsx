import React, { useState } from 'react';
import { 
  FadeTransition, 
  SlideTransition, 
  ScaleTransition, 
  PageTransition,
  StaggerContainer,
  StaggerItem,
  TabTransition,
  ModalTransition,
  ListItemTransition
} from '../ui/AnimatedTransitions';
import { GlassCard, GlassButton, GlassInput } from '../ui/GlassmorphismElements';
import { motion } from 'framer-motion';

const TransitionsShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fade');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listItems, setListItems] = useState<string[]>(['Item 1', 'Item 2', 'Item 3']);
  const [newItemText, setNewItemText] = useState('');
  
  // Background gradient for better transition visibility
  const backgroundStyle = {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    minHeight: '100vh',
    padding: '2rem',
  };
  
  const addListItem = () => {
    if (newItemText.trim() !== '') {
      setListItems([...listItems, newItemText]);
      setNewItemText('');
    }
  };
  
  const removeListItem = (index: number) => {
    const newItems = [...listItems];
    newItems.splice(index, 1);
    setListItems(newItems);
  };

  return (
    <div style={backgroundStyle} className="text-white">
      <PageTransition>
        <h2 className="text-3xl font-bold mb-8">Animated Transitions</h2>
        
        <div className="flex flex-wrap gap-3 mb-8">
          <GlassButton 
            variant={activeTab === 'fade' ? 'primary' : 'neutral'}
            onClick={() => setActiveTab('fade')}
          >
            Fade Transitions
          </GlassButton>
          <GlassButton 
            variant={activeTab === 'slide' ? 'primary' : 'neutral'}
            onClick={() => setActiveTab('slide')}
          >
            Slide Transitions
          </GlassButton>
          <GlassButton 
            variant={activeTab === 'scale' ? 'primary' : 'neutral'}
            onClick={() => setActiveTab('scale')}
          >
            Scale Transitions
          </GlassButton>
          <GlassButton 
            variant={activeTab === 'stagger' ? 'primary' : 'neutral'}
            onClick={() => setActiveTab('stagger')}
          >
            Staggered Animations
          </GlassButton>
          <GlassButton 
            variant={activeTab === 'modal' ? 'primary' : 'neutral'}
            onClick={() => setActiveTab('modal')}
          >
            Modal Transitions
          </GlassButton>
          <GlassButton 
            variant={activeTab === 'list' ? 'primary' : 'neutral'}
            onClick={() => setActiveTab('list')}
          >
            List Transitions
          </GlassButton>
        </div>
        
        <GlassCard className="p-6 min-h-[400px]">
          <TabTransition activeTab={activeTab} tabId="fade" direction="left">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Fade Transitions</h3>
              <p className="mb-6">
                Fade transitions provide a subtle way to reveal content, creating a smooth appearance and disappearance effect.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FadeTransition duration={0.5} delay={0}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">No Delay</div>
                      <div className="text-sm text-gray-300">Duration: 0.5s</div>
                    </div>
                  </GlassCard>
                </FadeTransition>
                
                <FadeTransition duration={0.5} delay={0.3}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">0.3s Delay</div>
                      <div className="text-sm text-gray-300">Duration: 0.5s</div>
                    </div>
                  </GlassCard>
                </FadeTransition>
                
                <FadeTransition duration={0.5} delay={0.6}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">0.6s Delay</div>
                      <div className="text-sm text-gray-300">Duration: 0.5s</div>
                    </div>
                  </GlassCard>
                </FadeTransition>
              </div>
              
              <div className="mt-6">
                <GlassButton onClick={() => setActiveTab('slide')}>
                  Next: Slide Transitions
                </GlassButton>
              </div>
            </div>
          </TabTransition>
          
          <TabTransition activeTab={activeTab} tabId="slide" direction="left">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Slide Transitions</h3>
              <p className="mb-6">
                Slide transitions add directional movement to elements, creating a more dynamic entrance and exit.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <SlideTransition direction="up" duration={0.5} delay={0}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">Slide Up</div>
                      <div className="text-sm text-gray-300">Elements enter from bottom</div>
                    </div>
                  </GlassCard>
                </SlideTransition>
                
                <SlideTransition direction="down" duration={0.5} delay={0.2}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">Slide Down</div>
                      <div className="text-sm text-gray-300">Elements enter from top</div>
                    </div>
                  </GlassCard>
                </SlideTransition>
                
                <SlideTransition direction="left" duration={0.5} delay={0.4}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">Slide Left</div>
                      <div className="text-sm text-gray-300">Elements enter from right</div>
                    </div>
                  </GlassCard>
                </SlideTransition>
                
                <SlideTransition direction="right" duration={0.5} delay={0.6}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">Slide Right</div>
                      <div className="text-sm text-gray-300">Elements enter from left</div>
                    </div>
                  </GlassCard>
                </SlideTransition>
              </div>
              
              <div className="flex justify-between">
                <GlassButton onClick={() => setActiveTab('fade')}>
                  Previous: Fade Transitions
                </GlassButton>
                <GlassButton onClick={() => setActiveTab('scale')}>
                  Next: Scale Transitions
                </GlassButton>
              </div>
            </div>
          </TabTransition>
          
          <TabTransition activeTab={activeTab} tabId="scale" direction="left">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Scale Transitions</h3>
              <p className="mb-6">
                Scale transitions create a zoom effect, making elements grow or shrink during transitions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <ScaleTransition initialScale={0.5} duration={0.5} delay={0}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">Scale Up (0.5)</div>
                      <div className="text-sm text-gray-300">From smaller size</div>
                    </div>
                  </GlassCard>
                </ScaleTransition>
                
                <ScaleTransition initialScale={0.8} duration={0.5} delay={0.3}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">Scale Up (0.8)</div>
                      <div className="text-sm text-gray-300">Subtle zoom effect</div>
                    </div>
                  </GlassCard>
                </ScaleTransition>
                
                <ScaleTransition initialScale={1.2} duration={0.5} delay={0.6}>
                  <GlassCard className="p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium">Scale Down (1.2)</div>
                      <div className="text-sm text-gray-300">From larger size</div>
                    </div>
                  </GlassCard>
                </ScaleTransition>
              </div>
              
              <div className="flex justify-between">
                <GlassButton onClick={() => setActiveTab('slide')}>
                  Previous: Slide Transitions
                </GlassButton>
                <GlassButton onClick={() => setActiveTab('stagger')}>
                  Next: Staggered Animations
                </GlassButton>
              </div>
            </div>
          </TabTransition>
          
          <TabTransition activeTab={activeTab} tabId="stagger" direction="left">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Staggered Animations</h3>
              <p className="mb-6">
                Staggered animations create a cascading effect by animating multiple elements with a slight delay between each.
              </p>
              
              <StaggerContainer delayChildren={0.2} staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <StaggerItem key={item} className="h-32">
                    <GlassCard className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-medium">Item {item}</div>
                        <div className="text-sm text-gray-300">Staggered entry</div>
                      </div>
                    </GlassCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              
              <div className="flex justify-between">
                <GlassButton onClick={() => setActiveTab('scale')}>
                  Previous: Scale Transitions
                </GlassButton>
                <GlassButton onClick={() => setActiveTab('modal')}>
                  Next: Modal Transitions
                </GlassButton>
              </div>
            </div>
          </TabTransition>
          
          <TabTransition activeTab={activeTab} tabId="modal" direction="left">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Modal Transitions</h3>
              <p className="mb-6">
                Modal transitions create smooth entrances and exits for dialog boxes and overlays.
              </p>
              
              <div className="flex justify-center mb-6">
                <GlassButton onClick={() => setIsModalOpen(true)}>
                  Open Modal
                </GlassButton>
              </div>
              
              <ModalTransition isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <GlassCard className="p-6 max-w-md w-full">
                  <h4 className="text-xl font-semibold mb-4">Modal Dialog</h4>
                  <p className="mb-6">
                    This modal uses smooth scale and fade transitions for a polished appearance.
                    Click outside or the close button to dismiss.
                  </p>
                  <div className="flex justify-end">
                    <GlassButton onClick={() => setIsModalOpen(false)}>
                      Close
                    </GlassButton>
                  </div>
                </GlassCard>
              </ModalTransition>
              
              <div className="flex justify-between">
                <GlassButton onClick={() => setActiveTab('stagger')}>
                  Previous: Staggered Animations
                </GlassButton>
                <GlassButton onClick={() => setActiveTab('list')}>
                  Next: List Transitions
                </GlassButton>
              </div>
            </div>
          </TabTransition>
          
          <TabTransition activeTab={activeTab} tabId="list" direction="left">
            <div>
              <h3 className="text-2xl font-semibold mb-4">List Transitions</h3>
              <p className="mb-6">
                List transitions create smooth animations when adding or removing items from a list.
              </p>
              
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <GlassInput
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="New item text..."
                    className="flex-grow"
                  />
                  <GlassButton onClick={addListItem}>
                    Add Item
                  </GlassButton>
                </div>
                
                <div className="space-y-2">
                  {listItems.map((item, index) => (
                    <ListItemTransition key={item + index} className="flex">
                      <GlassCard className="p-3 flex-grow flex justify-between items-center">
                        <span>{item}</span>
                        <GlassButton 
                          variant="danger" 
                          onClick={() => removeListItem(index)}
                          className="px-2 py-1 text-sm"
                        >
                          Remove
                        </GlassButton>
                      </GlassCard>
                    </ListItemTransition>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <GlassButton onClick={() => setActiveTab('modal')}>
                  Previous: Modal Transitions
                </GlassButton>
                <GlassButton onClick={() => setActiveTab('fade')}>
                  Back to Start
                </GlassButton>
              </div>
            </div>
          </TabTransition>
        </GlassCard>
        
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-6">Application Examples</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SlideTransition direction="up">
              <GlassCard className="p-6">
                <h4 className="text-xl font-medium mb-4">Page Transitions</h4>
                <p className="mb-4">
                  Smooth transitions between pages enhance navigation and create a more cohesive user experience.
                  The PageTransition component wraps route content for consistent animations.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-300">Example: Route changes</div>
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.div>
                </div>
              </GlassCard>
            </SlideTransition>
            
            <SlideTransition direction="up" delay={0.2}>
              <GlassCard className="p-6">
                <h4 className="text-xl font-medium mb-4">Tab Switching</h4>
                <p className="mb-4">
                  Animated tab transitions make content changes feel natural and help users understand the interface state.
                  The TabTransition component handles direction-based animations.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-300">Example: Content panels</div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ⟳
                  </motion.div>
                </div>
              </GlassCard>
            </SlideTransition>
            
            <SlideTransition direction="up" delay={0.4}>
              <GlassCard className="p-6">
                <h4 className="text-xl font-medium mb-4">Form Submissions</h4>
                <p className="mb-4">
                  Animated transitions during form submissions provide visual feedback and make the process feel more responsive.
                  Scale and fade transitions work well for success/error states.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-300">Example: Submit confirmations</div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ✓
                  </motion.div>
                </div>
              </GlassCard>
            </SlideTransition>
            
            <SlideTransition direction="up" delay={0.6}>
              <GlassCard className="p-6">
                <h4 className="text-xl font-medium mb-4">Data Loading</h4>
                <p className="mb-4">
                  Staggered animations for data loading create a polished experience when displaying search results or dashboard items.
                  The StaggerContainer and StaggerItem components handle these effects.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-300">Example: Search results</div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ↓
                  </motion.div>
                </div>
              </GlassCard>
            </SlideTransition>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default TransitionsShowcase;
