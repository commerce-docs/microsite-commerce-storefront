/**
 * Mermaid Diagram Styling Configuration
 * 
 * This file contains all styling configuration for Mermaid diagrams.
 * Styles are organized by diagram type for easy maintenance.
 * 
 * ===== HOW TO MODIFY STYLES =====
 * 
 * 1. Find the relevant section below (e.g., "FLOWCHART DIAGRAMS", "SEQUENCE DIAGRAMS")
 * 2. Update the color/style values
 * 3. Changes will apply to all diagrams of that type automatically
 * 
 * ===== DIAGRAM TYPES =====
 * 
 * - flowchart: Flowchart nodes, edges, subgraphs, and color scales
 * - sequence: Sequence diagram participants (individual styling by label)
 * - class: Class diagram boxes
 * - state: State diagram nodes
 * - er: Entity-relationship diagrams
 * - gantt: Gantt chart tasks and sections
 * - pie: Pie chart slices
 * - journey: User journey diagrams
 * - gitgraph: Git graph branches
 * - requirement: Requirement diagrams
 * - note: Note boxes (applies to all diagrams)
 * - mindmap: Mindmap nodes
 * - timeline: Timeline sections
 * - c4: C4 architecture diagrams
 * 
 * ===== COMMON STYLE CHANGES =====
 * 
 * To change subgraph colors:
 *   Edit flowchart.subgraph.fill and flowchart.subgraph.stroke
 * 
 * To change sequence diagram participant colors:
 *   Edit sequence.participants object (keys match participant label text)
 * 
 * To change default node colors:
 *   Edit flowchart.defaultNodeFill, flowchart.nodeTextColor, etc.
 * 
 * To change rounded corners:
 *   Edit flowchart.nodeCornerRadius and flowchart.subgraph.cornerRadius
 */

export const mermaidThemeConfig = {
  // ===== GLOBAL SETTINGS =====
  // These apply to all diagram types unless overridden
  global: {
    primaryColor: '#1976d2',
    primaryTextColor: '#000000',
    primaryBorderColor: '#1565c0',
    lineColor: '#666666',
    secondaryColor: '#666666',
    tertiaryColor: '#999999',
    background: '#ffffff',
    mainBkg: '#ffffff',
    secondBkg: '#f5f5f5',
    textColor: '#000000',
    secondaryTextColor: '#666666',
    border1: '#666666',
    border2: '#999999',
    border3: '#cccccc',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
  },

  // ===== FLOWCHART DIAGRAMS =====
  // Styles for flowchart nodes, edges, and subgraphs
  flowchart: {
    // Default node styling (applies to nodes without classDef)
    defaultNodeFill: 'none', // Transparent background for text nodes
    nodeTextColor: '#000000',
    nodeBorder: '#666666',
    nodeCornerRadius: 8, // Rounded corners for all boxes (in pixels)
    
    // Subgraph/cluster styling
    subgraph: {
      fill: '#ffffff', // White background
      stroke: '#cccccc', // Light gray border
      strokeWidth: '2px',
      strokeDasharray: '5,5', // Dotted border
      cornerRadius: 8, // Rounded corners
    },
    
    // Color scales for classDef styling (cScale0-7)
    colorScales: {
      cScale0: '#e3f2fd', // Light blue
      cScale1: '#f3e5f5', // Light purple
      cScale2: '#fff9c4', // Light yellow
      cScale3: '#e8f5e9', // Light green
      cScale4: '#ffe0b2', // Light orange
      cScale5: '#ffcdd2', // Light red
      cScale6: '#b2dfdb', // Light teal
      cScale7: '#f8bbd0', // Light pink
    },
    
    edgeLabelBackground: '#ffffff',
  },

  // ===== SEQUENCE DIAGRAMS =====
  // Styles for sequence diagram participants and messages
  sequence: {
    // Default participant box styling (applies to all participants globally)
    participantBoxFill: '#f5f5f5',
    participantBoxStroke: '#666666',
    
    // Actor box styling
    actorBoxFill: '#e3f2fd',
    actorBoxStroke: '#1976d2',
    
    // Activation box styling
    activationBoxFill: '#f5f5f5',
    activationBoxStroke: '#666666',
    
    // Individual participant styling (by label text)
    // These override the default styles above
    participants: {
      'user': { fill: '#E3F2FD', stroke: '#2196F3', strokeWidth: '2px' },
      'search() api': { fill: '#F3E5F5', stroke: '#9C27B0', strokeWidth: '2px' },
      'event bus': { fill: '#FFF9C4', stroke: '#FBC02D', strokeWidth: '2px' },
      'searchresults': { fill: '#E8F5E9', stroke: '#4CAF50', strokeWidth: '2px' },
      'facets': { fill: '#FFE0B2', stroke: '#FF9800', strokeWidth: '2px' },
      'pagination': { fill: '#FFCDD2', stroke: '#F44336', strokeWidth: '2px' },
      'sortby': { fill: '#B2DFDB', stroke: '#009688', strokeWidth: '2px' },
      'graphql api': { fill: '#F8BBD0', stroke: '#E91E63', strokeWidth: '2px' },
    },
  },

  // ===== CLASS DIAGRAMS =====
  class: {
    classBoxFill: '#ffffff',
    classBoxStroke: '#666666',
    classTextColor: '#000000',
  },

  // ===== STATE DIAGRAMS =====
  state: {
    stateBkgColor: '#ffffff',
    stateBorderColor: '#666666',
    stateLabelBkgColor: '#f5f5f5',
    stateLabelTextColor: '#000000',
    stateNodeBkgColor: '#e3f2fd',
    stateNodeBorderColor: '#1976d2',
  },

  // ===== ER DIAGRAMS =====
  er: {
    erBoxFillColor: '#ffffff',
    erBoxStrokeColor: '#666666',
    erTextColor: '#000000',
    erAttributeBoxFillColor: '#f5f5f5',
    erAttributeBoxStrokeColor: '#999999',
  },

  // ===== GANTT CHARTS =====
  gantt: {
    ganttSectionBkgColor: '#f5f5f5',
    ganttSectionStrokeColor: '#666666',
    ganttTaskBkgColor: '#e3f2fd',
    ganttTaskStrokeColor: '#1976d2',
    ganttTaskTextColor: '#000000',
    ganttTaskTextLightColor: '#666666',
    ganttTaskTextOutsideColor: '#000000',
    ganttTaskTextClickableColor: '#1976d2',
    ganttActiveTaskBkgColor: '#1976d2',
    ganttActiveTaskStrokeColor: '#1565c0',
    ganttGridColor: '#cccccc',
    ganttDoneTaskBkgColor: '#4caf50',
    ganttDoneTaskStrokeColor: '#388e3c',
    ganttCritTaskBkgColor: '#f44336',
    ganttCritTaskStrokeColor: '#d32f2f',
    ganttTodayLineColor: '#f44336',
  },

  // ===== PIE CHARTS =====
  pie: {
    pie1: '#e3f2fd',
    pie2: '#f3e5f5',
    pie3: '#fff9c4',
    pie4: '#e8f5e9',
    pie5: '#ffe0b2',
    pie6: '#ffcdd2',
    pie7: '#b2dfdb',
    pieTitleTextSize: '16px',
    pieTitleTextColor: '#000000',
    pieSectionTextSize: '14px',
    pieSectionTextColor: '#000000',
    pieLegendTextSize: '14px',
    pieLegendTextColor: '#000000',
    pieStrokeColor: '#ffffff',
  },

  // ===== USER JOURNEY DIAGRAMS =====
  journey: {
    journeyTaskBkgColor: '#e3f2fd',
    journeyTaskTextColor: '#000000',
    journeyTaskTextLightColor: '#666666',
    journeyActiveTaskBkgColor: '#1976d2',
    journeyActiveTaskBorderColor: '#1565c0',
    journeyActiveTaskTextColor: '#ffffff',
    journeyDoneTaskBkgColor: '#4caf50',
    journeyDoneTaskBorderColor: '#388e3c',
    journeyDoneTaskTextColor: '#ffffff',
    journeyTaskBorderColor: '#666666',
    journeyCritTaskBkgColor: '#f44336',
    journeyCritTaskBorderColor: '#d32f2f',
    journeyCritTaskTextColor: '#ffffff',
    journeyTaskTextOutsideColor: '#000000',
    journeyTaskTextClickableColor: '#1976d2',
  },

  // ===== GITGRAPH DIAGRAMS =====
  gitgraph: {
    git0: '#e3f2fd',
    git1: '#f3e5f5',
    git2: '#fff9c4',
    git3: '#e8f5e9',
    git4: '#ffe0b2',
    git5: '#ffcdd2',
    git6: '#b2dfdb',
    git7: '#f8bbd0',
    gitBranchLabel0: '#000000',
    gitBranchLabel1: '#000000',
    gitBranchLabel2: '#000000',
    gitBranchLabel3: '#000000',
    gitBranchLabel4: '#000000',
    gitBranchLabel5: '#000000',
    gitBranchLabel6: '#000000',
    gitBranchLabel7: '#000000',
  },

  // ===== REQUIREMENT DIAGRAMS =====
  requirement: {
    requirementBkgColor: '#ffffff',
    requirementBorderColor: '#666666',
    requirementTextColor: '#000000',
    relationBkgColor: '#f5f5f5',
    relationBorderColor: '#999999',
  },

  // ===== NOTE BOXES (all diagrams) =====
  note: {
    noteBkgColor: '#fff9c4',
    noteTextColor: '#000000',
    noteBorderColor: '#fbc02d',
  },

  // ===== MINDMAP DIAGRAMS =====
  mindmap: {
    mindmapNodeBkgColor: '#ffffff',
    mindmapNodeBorderColor: '#666666',
    mindmapNodeTextColor: '#000000',
  },

  // ===== TIMELINE DIAGRAMS =====
  timeline: {
    timelineBkgColor: '#ffffff',
    timelineBorderColor: '#666666',
    timelineTextColor: '#000000',
    timelineSectionBkgColor: '#f5f5f5',
    timelineSectionStrokeColor: '#999999',
  },

  // ===== C4 DIAGRAMS =====
  c4: {
    c4PersonBkgColor: '#e3f2fd',
    c4PersonBorderColor: '#1976d2',
    c4SystemBkgColor: '#f3e5f5',
    c4SystemBorderColor: '#9c27b0',
    c4ContainerBkgColor: '#fff9c4',
    c4ContainerBorderColor: '#fbc02d',
    c4ComponentBkgColor: '#e8f5e9',
    c4ComponentBorderColor: '#4caf50',
    c4DbBkgColor: '#ffe0b2',
    c4DbBorderColor: '#ff9800',
    c4QueueBkgColor: '#ffcdd2',
    c4QueueBorderColor: '#f44336',
  },
} as const;

/**
 * Helper function to build Mermaid themeVariables object from config
 */
export function buildMermaidThemeVariables() {
  return {
    // Global settings
    ...mermaidThemeConfig.global,
    
    // Flowchart
    defaultNodeFill: mermaidThemeConfig.flowchart.defaultNodeFill,
    clusterFill: mermaidThemeConfig.flowchart.subgraph.fill,
    clusterBkg: mermaidThemeConfig.flowchart.subgraph.fill,
    clusterBorder: mermaidThemeConfig.flowchart.subgraph.stroke,
    cScale0: mermaidThemeConfig.flowchart.colorScales.cScale0,
    cScale1: mermaidThemeConfig.flowchart.colorScales.cScale1,
    cScale2: mermaidThemeConfig.flowchart.colorScales.cScale2,
    cScale3: mermaidThemeConfig.flowchart.colorScales.cScale3,
    cScale4: mermaidThemeConfig.flowchart.colorScales.cScale4,
    cScale5: mermaidThemeConfig.flowchart.colorScales.cScale5,
    cScale6: mermaidThemeConfig.flowchart.colorScales.cScale6,
    cScale7: mermaidThemeConfig.flowchart.colorScales.cScale7,
    nodeTextColor: mermaidThemeConfig.flowchart.nodeTextColor,
    nodeBorder: mermaidThemeConfig.flowchart.nodeBorder,
    edgeLabelBackground: mermaidThemeConfig.flowchart.edgeLabelBackground,
    
    // Sequence diagrams
    participantBoxFillColor: mermaidThemeConfig.sequence.participantBoxFill,
    participantBoxStrokeColor: mermaidThemeConfig.sequence.participantBoxStroke,
    actorBoxFillColor: mermaidThemeConfig.sequence.actorBoxFill,
    actorBoxStrokeColor: mermaidThemeConfig.sequence.actorBoxStroke,
    activationBoxFillColor: mermaidThemeConfig.sequence.activationBoxFill,
    activationBoxStrokeColor: mermaidThemeConfig.sequence.activationBoxStroke,
    
    // Class diagrams
    ...mermaidThemeConfig.class,
    
    // State diagrams
    ...mermaidThemeConfig.state,
    
    // ER diagrams
    ...mermaidThemeConfig.er,
    
    // Gantt charts
    ...mermaidThemeConfig.gantt,
    
    // Pie charts
    ...mermaidThemeConfig.pie,
    
    // User journey
    ...mermaidThemeConfig.journey,
    
    // Gitgraph
    ...mermaidThemeConfig.gitgraph,
    
    // Requirement
    ...mermaidThemeConfig.requirement,
    
    // Note boxes
    ...mermaidThemeConfig.note,
    
    // Mindmap
    ...mermaidThemeConfig.mindmap,
    
    // Timeline
    ...mermaidThemeConfig.timeline,
    
    // C4
    ...mermaidThemeConfig.c4,
  };
}
