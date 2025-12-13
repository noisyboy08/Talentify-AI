import {
  MotionValue,
  useMotionValue,
  type SpringOptions,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '~/lib/utils';

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
};

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DocContextType = {
  mouseX: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.3, stiffness: 300, damping: 25 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  // No mouse tracking needed - fixed size items
  const mouseX = useMotionValue(Infinity);

  const isHorizontal = className?.includes('flex-row');
  
  return (
    <div className={cn(
      'flex max-h-full items-center overflow-x-auto overflow-y-hidden',
      isHorizontal ? 'my-0' : 'my-2'
    )}>
      <div
        className={cn(
          'my-auto flex w-fit gap-2 sm:gap-3 md:gap-4 rounded-2xl bg-white/90 backdrop-blur-md py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 border border-gray-200/50 shadow-xl',
          className
        )}
        style={{ 
          width: isHorizontal ? 'auto' : panelHeight,
          height: isHorizontal ? panelHeight : 'auto'
        }}
        role='toolbar'
        aria-label='Application dock'
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </div>
    </div>
  );
}

function DockItem({ children, className }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);
  const { magnification } = useDock();

  // Fixed size - no animation
  const fixedSize = 40;

  return (
    <div
      ref={ref}
      style={{ 
        width: fixedSize, 
        height: fixedSize,
      }}
      onMouseEnter={() => isHovered.set(1)}
      onMouseLeave={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement<any>, { width: fixedSize, isHovered })
      )}
    </div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as MotionValue<number>;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute right-full top-1/2 -translate-y-1/2 mr-3 w-fit whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-lg pointer-events-none z-50',
        className
      )}
      role='tooltip'
    >
      {children}
    </div>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps['width'] as number;

  // Fixed icon size - half of the item size
  const iconSize = width / 2;

  return (
    <div
      style={{ width: iconSize, height: iconSize }}
      className={cn('flex items-center justify-center', className)}
    >
      {children}
    </div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };
