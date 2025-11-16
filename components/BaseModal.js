const { computed } = Vue

export const BaseModal = {
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: 'info',
            validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
        }
    },
    emits: ['update:modelValue', 'close'],
    template: `
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="modelValue" class="modal-overlay" @click="handleClose">
                    <div class="modal-container" @click.stop>
                        <div class="modal-content" :class="modalTypeClass">
                            <div class="modal-header">
                                <div class="modal-icon" v-if="iconEmoji">{{ iconEmoji }}</div>
                                <h2 class="modal-title">{{ title }}</h2>
                                <button class="modal-close" @click="handleClose" aria-label="Close modal">
                                    ×
                                </button>
                            </div>
                            <div class="modal-body">
                                <slot></slot>
                            </div>
                            <div class="modal-footer" v-if="$slots.footer">
                                <slot name="footer"></slot>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    `,
    setup(props, { emit }) {
        const modalTypeClass = computed(() => `modal-type-${props.type}`)
        
        const iconEmoji = computed(() => {
            const icons = {
                info: 'ℹ️',
                success: '✅',
                warning: '⚠️',
                error: '❌'
            }
            return icons[props.type]
        })
        
        const handleClose = () => {
            emit('update:modelValue', false)
            emit('close')
        }
        
        return {
            modalTypeClass,
            iconEmoji,
            handleClose
        }
    }
}
