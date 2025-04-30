"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"

interface SearchSettingsProps {
  className?: string
  onSave: (settings: SearchSettingsValues) => void
  initialValues?: Partial<SearchSettingsValues>
}

export interface SearchSettingsValues {
  efSearch: number
  distanceThreshold: number
  resultLimit: number
  useHybridSearch: boolean
  hybridAlpha: number
  preprocessQuery: boolean
  preprocessStrategy: 'chain-of-thought' | 'tree-of-thoughts' | 'react' | 'role' | null
}

const defaultValues: SearchSettingsValues = {
  efSearch: 128,
  distanceThreshold: 0.75,
  resultLimit: 5,
  useHybridSearch: false,
  hybridAlpha: 0.5,
  preprocessQuery: true,
  preprocessStrategy: 'chain-of-thought'
}

export function SearchSettings({ 
  className, 
  onSave,
  initialValues = {}
}: SearchSettingsProps) {
  const [values, setValues] = React.useState<SearchSettingsValues>({
    ...defaultValues,
    ...initialValues
  })

  const handleChange = <K extends keyof SearchSettingsValues>(
    key: K,
    value: SearchSettingsValues[K]
  ) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    onSave(values)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Result Limit */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="resultLimit">Result Limit (Top-N Chunks)</Label>
          <span className="text-sm text-dark-300">{values.resultLimit}</span>
        </div>
        <Slider
          id="resultLimit"
          min={1}
          max={20}
          step={1}
          value={[values.resultLimit]}
          onValueChange={(value) => handleChange("resultLimit", value[0])}
          className="w-full"
        />
        <p className="text-xs text-dark-400">
          Number of chunks to retrieve from the vector store
        </p>
      </div>
      
      {/* Distance Threshold */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="distanceThreshold">Distance Threshold</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-300">{values.distanceThreshold.toFixed(2)}</span>
            <span className="text-xs text-dark-400">
              {values.distanceThreshold < 0.2
                ? "Very Relevant"
                : values.distanceThreshold <= 0.5
                ? "Moderately Relevant"
                : "Less Relevant"}
            </span>
          </div>
        </div>
        <Slider
          id="distanceThreshold"
          min={0}
          max={1}
          step={0.01}
          value={[values.distanceThreshold]}
          onValueChange={(value) => handleChange("distanceThreshold", value[0])}
          className="w-full"
        />
        <p className="text-xs text-dark-400">
          Maximum distance for a chunk to be considered relevant
        </p>
      </div>
      
      {/* Preprocess Query */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="preprocessQuery" className="block mb-1">Preprocess Query</Label>
            <p className="text-xs text-dark-400">
              Apply preprocessing to the query before searching
            </p>
          </div>
          <Switch
            id="preprocessQuery"
            checked={values.preprocessQuery}
            onCheckedChange={(checked) => handleChange("preprocessQuery", checked)}
          />
        </div>
        
        {values.preprocessQuery && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={values.preprocessStrategy === 'chain-of-thought' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleChange("preprocessStrategy", 'chain-of-thought')}
            >
              Chain of Thought
            </Button>
            <Button
              variant={values.preprocessStrategy === 'tree-of-thoughts' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleChange("preprocessStrategy", 'tree-of-thoughts')}
            >
              Tree of Thoughts
            </Button>
            <Button
              variant={values.preprocessStrategy === 'react' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleChange("preprocessStrategy", 'react')}
            >
              ReAct
            </Button>
            <Button
              variant={values.preprocessStrategy === 'role' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleChange("preprocessStrategy", 'role')}
            >
              Role
            </Button>
          </div>
        )}
      </div>

      {/* EF Search */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="efSearch">EF Search (Accuracy vs Speed)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-300">{values.efSearch}</span>
            <span className="text-xs text-dark-400">
              {values.efSearch <= 50
                ? "Fast Response"
                : values.efSearch <= 200
                ? "Balanced"
                : "High Accuracy"}
            </span>
          </div>
        </div>
        <Slider
          id="efSearch"
          min={32}
          max={512}
          step={16}
          value={[values.efSearch]}
          onValueChange={(value) => handleChange("efSearch", value[0])}
          className="w-full"
        />
        <p className="text-xs text-dark-400">
          Higher values increase accuracy but decrease speed
        </p>
      </div>
      
      {/* Hybrid Search */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="useHybridSearch" className="block mb-1">Use Hybrid Search</Label>
          <p className="text-xs text-dark-400">
            Combine vector search with keyword search
          </p>
        </div>
        <Switch
          id="useHybridSearch"
          checked={values.useHybridSearch}
          onCheckedChange={(checked) => handleChange("useHybridSearch", checked)}
        />
      </div>
      
      {/* Hybrid Alpha */}
      {values.useHybridSearch && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="hybridAlpha">Hybrid Alpha</Label>
            <span className="text-sm text-dark-300">{values.hybridAlpha.toFixed(2)}</span>
          </div>
          <Slider
            id="hybridAlpha"
            min={0}
            max={1}
            step={0.01}
            value={[values.hybridAlpha]}
            onValueChange={(value) => handleChange("hybridAlpha", value[0])}
            className="w-full"
          />
          <p className="text-xs text-dark-400">
            Balance between vector (0) and keyword (1) search
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
