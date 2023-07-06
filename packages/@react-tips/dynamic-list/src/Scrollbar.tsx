import React, { ReactElement, MouseEvent } from 'react'

const defaultProps = {
  children: undefined,
  contentHeight: undefined,
  color: undefined,
  className: undefined,
  monkey: false,
  fade: false,
  alwaysVisible: false,
  anchor: 'top',
  role: 'presentation',
  'aria-label': undefined,
  'aria-describedby': undefined,
  onScroll: undefined,
  onContentScroll: () => {},
  onTrackClick: undefined,
  initialScrollTop: 0,
  id: undefined,
  inheritSize: false,
  useFixedTrackHeight: false,
}

interface Props {
  initialScrollTop?: number
  height?: number
  anchor?: 'top' | 'bottom'
  onScroll?: (e: MouseEvent) => {}
  onTrackClick?: (e: MouseEvent) => {}
}

interface State {
  height: number
  top: number
}

export class Scrollbar extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps
  static displayName = 'Scrollbar'
  static track = {
    to: (e) => {
      let { y, scrollTop, scrollHeight, trackHeight, barTop, barHeight } = e
      return (
        scrollTop + (y - barTop - barHeight / 2) * (scrollHeight / trackHeight)
      )
    },
    page: (e) => {
      let { y, scrollTop, trackHeight, barTop } = e
      return y < barTop
        ? scrollTop - (trackHeight - 21)
        : scrollTop + (trackHeight - 21)
    },
  }

  private scroller: {
    scrollTop?: number
  }
  private currentScrollTop: number
  private dragging: boolean
  private delta: {
    y?: number | null
    top?: number | null
    speed?: number | null
  }
  private trackInterval: any
  private trackTimeout: any
  private trackAnimation: any

  constructor(props: Props) {
    super(props)

    this.scroller = null
    this.currentScrollTop = 0
    this.dragging = false
    this.delta = {
      y: null,
      top: null,
      speed: null,
    }
    this.trackInterval = undefined
    this.trackTimeout = undefined
    this.trackAnimation = undefined

    this.state = {
      height: 0,
      top: 0,
    }
  }

  componentDidMount(): void {
    this.scroller.scrollTop = this.props.initialScrollTop
  }

  componentDidUpdate(): void {
    this.update()
  }

  componentWillUnmount(): void {
    if (this.trackAnimation) this.trackAnimation.cancel()
    clearInterval(this.trackInterval)
    clearTimeout(this.trackTimeout)
    window.removeEventListener('mouseup', this.onTrackUp)
  }

  onDrag = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const { clientY } = event

    const scrollHeight = this.getScrollHeight()
    const a = (clientY - this.delta.y) * this.delta.speed
    const scrollTop =
      'top' === this.props.anchor
        ? this.delta.top + a
        : scrollHeight - (this.delta.top - a)
    this.scrollTop(scrollTop)
  }

  onDragEnd = () => {
    this.dragging = false
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.onDragEnd)
    document.removeEventListener('mouseleave', this.onDragEnd)
  }

  onDragStart = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const scrollHeight = this.getScrollHeight()
    const trackHeight = this.getTrackHeight()
    this.dragging = false
    this.delta.y = e.clientY
    this.delta.top =
      'top' === this.props.anchor
        ? this.currentScrollTop
        : scrollHeight - this.currentScrollTop
    this.delta.speed = scrollHeight / trackHeight

    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.onDragEnd)
    document.removeEventListener('mouseleave', this.onDragEnd)
  }

  onScroll = (e: MouseEvent) => {
    if (!this.scroller) return
    const scrollTop = this.scroller.scrollTop

    if (!scrollTop || scrollTop !== this.currentScrollTop) {
      this.currentScrollTop = scrollTop
      this.update()
      if (this.props.onScroll) this.props.onScroll(e)
    }
  }

  onTrackDown = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const t = this.props.onTrackClick || Scrollbar.track.to
    const { offsetY } = e.nativeEvent

    const a = () => {
      console.log('Will animation scroll')
    }

    a()
    clearInterval(this.trackInterval)
    clearTimeout(this.trackTimeout)
    this.trackTimeout = setTimeout(() => {
      a()
      this.trackInterval = setInterval(a, 200)
    }, 500)
    window.addEventListener('mouseup', this.onTrackUp)
  }

  onTrackUp = () => {
    if (this.trackAnimation) this.trackAnimation.cancel()
    clearInterval(this.trackInterval)
    clearTimeout(this.trackTimeout)
    window.removeEventListener('mouseup', this.onTrackUp)
  }

  getBarHeight = (_scrollHeight?: number) => {
    let scrollHeight = _scrollHeight || this.getScrollHeight()
    const height = this.props.height
    return scrollHeight === 0 ? 0 : height / (scrollHeight * height)
  }

  render(): React.ReactNode {
    return <div>Scrollbar</div>
  }
}
