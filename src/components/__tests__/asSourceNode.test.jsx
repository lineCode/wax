import { createAsSourceNode } from '../asSourceNode';
import { createStubAudioContext } from '../../__tests__/helpers';

const createStubSourceNode = () => ({
    start: jest.fn(),
    stop: jest.fn(),
});

describe('asSourceNode HOC', () => {
    // used by both asSourceNode and JSX below
    const createAudioElement = jest.fn().mockImplementation(
        (Component, props, ...children) =>
            Component({
                children,
                ...props,
            })
    );

    let asSourceNode;

    beforeEach(() => {
        asSourceNode = createAsSourceNode(createAudioElement);
    });

    it('should create a new component that proxies incoming props and provides an enqueue prop', () => {
        const MyComponent = props => ({ props }); // TODO: common, reusable pattern across tests?
        const SourceComponent = asSourceNode(MyComponent);
        const sourceElement = <SourceComponent foo="bar" />;

        expect(sourceElement.props.foo).toEqual('bar');
        expect(sourceElement.props.enqueue).toBeDefined();
    });

    it('should schedule playback of the source node based upon the startTime prop and context`s current time', () => {
        const audioContext = createStubAudioContext(3);
        const audioNode = createStubSourceNode();
        const MyComponent = ({ enqueue, node }) => enqueue(node);
        const SourceComponent = asSourceNode(MyComponent);

        <SourceComponent
            startTime={1}
            audioContext={audioContext}
            node={audioNode}
        />;

        expect(audioNode.start).toHaveBeenCalledTimes(1);
        expect(audioNode.start).toHaveBeenCalledWith(4);
        expect(audioNode.stop).not.toHaveBeenCalled();
    });

    it('should schedule the stopping of the source node when endTime is provided', () => {
        const audioContext = createStubAudioContext(3);
        const audioNode = createStubSourceNode();
        const MyComponent = ({ enqueue, node }) => enqueue(node);
        const SourceComponent = asSourceNode(MyComponent);

        <SourceComponent
            startTime={1}
            endTime={5}
            audioContext={audioContext}
            node={audioNode}
        />;

        expect(audioNode.start).toHaveBeenCalledTimes(1);
        expect(audioNode.start).toHaveBeenCalledWith(4);
        expect(audioNode.stop).toHaveBeenCalledTimes(1);
        expect(audioNode.stop).toHaveBeenCalledWith(8);
    });

    it('should not schedule node playback or stopping when it has already been scheduled', () => {
        const audioContext = createStubAudioContext(3);
        const audioNode = createStubSourceNode();
        const MyComponent = ({ enqueue, node }) => enqueue(node);
        const SourceComponent = asSourceNode(MyComponent);

        audioNode.isScheduled = true;

        <SourceComponent
            startTime={1}
            endTime={5}
            audioContext={audioContext}
            node={audioNode}
        />;

        expect(audioNode.start).not.toHaveBeenCalled();
        expect(audioNode.stop).not.toHaveBeenCalled();
    });
});
