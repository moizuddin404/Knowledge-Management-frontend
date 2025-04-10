import React from 'react'
import MyEditor from '../components/RichTextEditor'
import SkeletonCard from '../components/SkeletonCard'

const Suites = () =>
     {
  return (
    <div>
        <div>Suites</div>
        <div>
      <h2>React Draft WYSIWYG Editor</h2>
      <MyEditor />
    </div>
    <SkeletonCard />
    </div>

  )
}

export default Suites
